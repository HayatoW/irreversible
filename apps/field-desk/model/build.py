"""Field Desk の GLB を生成する。--poster 指定時は静止画の WebP も生成する。

座標の単位はミリメートルで、+Y が背面方向、+Z が上向き。
公開されていない寸法は製品写真から推定している。
"""

import argparse
import math
import random
import sys
from functools import lru_cache
from pathlib import Path

import bmesh
import bpy
from mathutils import Matrix, Vector


MM = 0.001
WIDTH = 1195
DEPTH = 770
HEIGHT = 750
BOARD_WIDTH = 1155
PITCH = 25


def meters(point):
    return Vector(point) * MM


def material(name, color, metallic=0.0, roughness=0.5):
    result = bpy.data.materials.new(name)
    result.use_nodes = True
    shader = result.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = (*color, 1)
    shader.inputs["Metallic"].default_value = metallic
    shader.inputs["Roughness"].default_value = roughness
    return result


def mesh_object(name, points, faces, surface=None):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata([meters(point) for point in points], [], faces)
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    if surface:
        mesh.materials.append(surface)
    bm = bmesh.new()
    bm.from_mesh(mesh)
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    bm.to_mesh(mesh)
    bm.free()
    return obj


def finish(obj, sharp_angle=30):
    for face in obj.data.polygons:
        face.use_smooth = True
    obj.data.set_sharp_from_angle(angle=math.radians(sharp_angle))
    return obj


def strips(faces, first, second, count):
    for index in range(count):
        next_index = (index + 1) % count
        faces.append((first + index, first + next_index, second + next_index, second + index))


def ring_points(radius, z, count=20):
    return [
        (radius * math.cos(a), radius * math.sin(a), z)
        for a in (math.tau * i / count for i in range(count))
    ]


def apply_modifier(obj, modifier):
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier=modifier.name)


def cuboid(name, center, size, surface, radius):
    bpy.ops.mesh.primitive_cube_add(size=1, location=meters(center))
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = meters(size)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(surface)
    bevel = obj.modifiers.new("Machined edges", "BEVEL")
    bevel.width = radius * MM
    bevel.segments = 3
    apply_modifier(obj, bevel)
    finish(obj)
    normals = obj.modifiers.new("Planar face normals", "WEIGHTED_NORMAL")
    normals.keep_sharp = True
    apply_modifier(obj, normals)
    return obj


def place_mesh(obj, location, axis=None):
    obj.location = meters(location)
    if axis is not None:
        obj.rotation_mode = "QUATERNION"
        obj.rotation_quaternion = Vector(axis).to_track_quat("Z", "Y")


def profile20():
    """四面に溝があり、角に丸みを帯びたリブがある断面。"""
    side = [(-9.4, 10), (-7.8, 10), (-7.45, 9.7), (-6.8, 8.5),
            (6.8, 8.5), (7.45, 9.7), (7.8, 10), (9.4, 10), (9.85, 9.85)]
    points = []
    for _ in range(4):
        points.extend(side)
        side = [(y, -x) for x, y in side]
    return [(y, x) for x, y in points]


def profile10():
    return [(-4.5, -5), (4.5, -5), (5, -4.5), (5, 4.5),
            (4.5, 5), (-4.5, 5), (-5, 4.5), (-5, -4.5)]


def drill(obj, positions, axis, radius, shoulder):
    points, faces = [], []
    sections = 20
    for hole in positions:
        start = len(points)
        # 両端が広がる形状でくり抜き、貫通穴の両側の開口部に面取りを作る。
        for r, z in [(radius + 0.28, -12), (radius + 0.28, -shoulder),
                     (radius, -shoulder + 0.28), (radius, shoulder - 0.28),
                     (radius + 0.28, shoulder), (radius + 0.28, 12)]:
            for x, y, depth in ring_points(r, z, sections):
                points.append((depth, x, hole + y) if axis == "X"
                              else (x, depth, hole + y))
        for index in range(5):
            strips(faces, start + index * sections, start + (index + 1) * sections, sections)
        faces.extend([tuple(reversed(range(start, start + sections))),
                      tuple(range(start + 5 * sections, start + 6 * sections))])
    cutter = mesh_object("Hole cutters", points, faces)
    modifier = obj.modifiers.new("Perforations", "BOOLEAN")
    modifier.object = cutter
    modifier.operation = "DIFFERENCE"
    modifier.solver = "EXACT"
    apply_modifier(obj, modifier)
    bpy.data.objects.remove(cutter, do_unlink=True)


@lru_cache
def rail_mesh(kind, length, surface):
    if kind == "R20":
        outline = profile20()
        bore_radius = 3.2
    else:
        outline = profile10()
        bore_radius = 1.9
    count = len(outline)
    lo, hi = -length / 2, length / 2
    # 内周の頂点を外周の各頂点と同じ角度に揃え、端面を形作る。
    bore = [(bore_radius * x / math.hypot(x, y), bore_radius * y / math.hypot(x, y))
            for x, y in outline]
    points = ([(x, y, z) for profile in [outline, bore] for z in [lo, hi] for x, y in profile])
    faces = []
    strips(faces, 0, count, count)
    strips(faces, 2 * count, 3 * count, count)
    strips(faces, 0, 2 * count, count)
    strips(faces, count, 3 * count, count)
    obj = mesh_object(f"{kind} extrusion", points, faces, surface)
    hole_count = int((length - 15) / PITCH) + 1
    holes = [(index - (hole_count - 1) / 2) * PITCH for index in range(hole_count)]
    if kind == "R20":
        drill(obj, holes, "X", 3.0, 8.5)
        drill(obj, holes, "Y", 3.0, 8.5)
    else:
        drill(obj, holes, "Y", 2.4, 5)
    mesh = finish(obj).data
    bpy.data.objects.remove(obj, do_unlink=True)
    return mesh


def rail(kind, label, start, end, surface, bore_direction=None):
    start, end = Vector(start), Vector(end)
    track = (end - start).normalized()
    obj = bpy.data.objects.new(f"{kind} · {label}", rail_mesh(kind, round((end - start).length, 3), surface))
    bpy.context.collection.objects.link(obj)
    place_mesh(obj, (start + end) / 2, track)
    if bore_direction is not None:
        normal = Vector(bore_direction).normalized()
        tangent = normal.cross(track).normalized()
        obj.rotation_quaternion = Matrix((tangent, normal, track)).transposed().to_quaternion()
    return obj


@lru_cache
def socket_mesh(radius, surface, recess):
    """外周を面取りし、六角穴を設けたネジ頭。"""
    count = 24
    points = []
    for r, z in [(radius * 0.67, -1.4), (radius, -0.4), (radius, 0),
                 (radius * 0.88, 0.22), (radius * 0.52, 0.22),
                 (radius * 0.52, -0.95)]:
        for index in range(count):
            a = math.tau * index / count
            if len(points) >= 4 * count:
                # 中心から伸びる半直線と六角形の辺が交わる位置を求める。
                hex_angle = (a % (math.tau / 6)) - math.pi / 6
                dist = r * math.cos(math.pi / 6) / math.cos(hex_angle)
            else:
                dist = r
            points.append((dist * math.cos(a), dist * math.sin(a), z))
    faces = []
    for index in range(5):
        strips(faces, index * count, (index + 1) * count, count)
    faces.extend([tuple(reversed(range(count))), tuple(range(5 * count, 6 * count))])
    obj = mesh_object("Socket screw", points, faces, surface)
    obj.data.materials.append(recess)
    obj.data.polygons[-1].material_index = 1
    mesh = finish(obj).data
    bpy.data.objects.remove(obj, do_unlink=True)
    return mesh


def screw(at, axis, radius, surfaces):
    obj = bpy.data.objects.new("Hex socket screw", socket_mesh(radius, surfaces["steel"], surfaces["recess"]))
    bpy.context.collection.objects.link(obj)
    place_mesh(obj, at, axis)


def clamp(name, start, end, outward, width, surfaces):
    """レールの端を覆う丸みのあるクランプ板。先端に六角穴付きネジを配置する。"""
    start, end, outward = Vector(start), Vector(end), Vector(outward)
    travel = (end - start).normalized()
    across = outward.cross(travel)
    radius = width / 2
    outline = []
    for center, base in ((end, -math.pi / 2), (start, math.pi / 2)):
        for i in range(13):
            angle = base + math.pi * i / 12
            outline.append(center + radius * (math.cos(angle) * travel + math.sin(angle) * across))
    points = [point + thickness * outward for thickness in [-1.8, 0.0] for point in outline]
    count = len(outline)
    faces = [tuple(range(count)), tuple(range(count, 2 * count))]
    strips(faces, 0, count, count)
    obj = mesh_object(name, points, faces, surfaces["clamp"])
    bevel = obj.modifiers.new("Machined edges", "BEVEL")
    bevel.width = 0.35 * MM
    bevel.segments = 3
    apply_modifier(obj, bevel)
    finish(obj)
    normals = obj.modifiers.new("Planar face normals", "WEIGHTED_NORMAL")
    normals.keep_sharp = True
    apply_modifier(obj, normals)
    screw(end + outward * 0.24, outward, 3.4 if width > 12 else 2.9, surfaces)


def plywood():
    """木口に見える樺の木目と接着層をテクスチャに描く。"""
    width, height = 512, 128
    rng = random.Random(77)
    pixels = []
    tones = [0.89, 1, 0.91, 1.06, 0.90, 1.03, 0.89, 0.99, 0.87, 1.05, 0.92]
    for y in range(height):
        phase = y / height * len(tones)
        tone = tones[int(phase)]
        darken = 0.22 if phase % 1 < 0.07 else 0
        for x in range(width):
            grain = 0.018 * math.sin(y * 2 + 2.1 * math.sin(x * 0.018))
            grain += 0.012 * math.sin(y * 0.6 + x * 0.043) + rng.uniform(-0.014, 0.014)
            value = tone - darken + grain
            pixels.extend((0.49 * value, 0.34 * value, 0.215 * value, 1))
    image = bpy.data.images.new("Birch veneer grain", width=width, height=height)
    image.pixels.foreach_set(pixels)
    image.pack()
    result = material("Birch plywood · exposed plies", (0.49, 0.34, 0.215), roughness=0.48)
    node = result.node_tree.nodes.new("ShaderNodeTexImage")
    node.image = image
    shader = result.node_tree.nodes.get("Principled BSDF")
    result.node_tree.links.new(node.outputs["Color"], shader.inputs["Base Color"])
    return result


def tabletop(laminate):
    edge = plywood()
    # 上下面の化粧板は外周の小さな面取りまで回り込む。
    points, faces = [], []
    levels = [(731, 0.45), (731.55, 0), (732.15, 0), (748.85, 0),
              (749.45, 0), (750, 0.45)]
    radius = 0.9
    for z, inset in levels:
        for side, (sx, sy) in enumerate(((1, 1), (-1, 1), (-1, -1), (1, -1))):
            cx = sx * (BOARD_WIDTH / 2 - radius)
            cy = sy * (DEPTH / 2 - radius)
            for index in range(5):
                angle = math.pi / 2 * (side + index / 4)
                points.append((cx + (radius - inset) * math.cos(angle),
                               cy + (radius - inset) * math.sin(angle), z))
    count = len(points) // len(levels)
    for index in range(len(levels) - 1):
        strips(faces, index * count, (index + 1) * count, count)
    faces.extend((tuple(range(count)), tuple(range(len(points) - count, len(points)))))
    obj = mesh_object("Formica tabletop", points, faces, laminate)
    obj.data.materials.append(edge)
    uv = obj.data.uv_layers.new()
    for face in obj.data.polygons[2 * count:3 * count]:
        face.material_index = 1
        edge_index = face.index % count
        a, b = Vector(points[edge_index][:2]), Vector(points[(edge_index + 1) % count][:2])
        for loop in face.loop_indices:
            x, y, z = points[obj.data.loops[loop].vertex_index]
            distance = 0 if Vector((x, y)) == a else (b - a).length
            uv.data[loop].uv = (distance / 545, (z - 732.15) / 16.7)
    finish(obj, 29)


def build_desk():
    surfaces = {
        "rail": material("Anodized CIRCAL aluminum", (0.54, 0.56, 0.59), 0.86, 0.29),
        "clamp": material("Machined aluminum clamps", (0.47, 0.50, 0.53), 0.8, 0.35),
        "steel": material("Satin steel fasteners", (0.27, 0.28, 0.29), 0.8, 0.30),
        "recess": material("Dark recessed sockets", (0.033, 0.034, 0.037), 0.3, 0.5),
        "rubber": material("Black rubber feet", (0.025, 0.026, 0.027), roughness=0.7),
        "laminate": material("Light grey Formica laminate", (0.44, 0.45, 0.46), roughness=0.44),
    }
    tabletop(surfaces["laminate"])
    rail_surface = surfaces["rail"]
    x_center = WIDTH / 2 - 10
    y_center = DEPTH / 2 - 10
    for side, sign in [("Left", -1), ("Right", 1)]:
        x = sign * x_center
        upper, lower = HEIGHT - 10, 13.5
        rail("R20", f"{side} top", (x, -DEPTH / 2, upper), (x, DEPTH / 2, upper), rail_surface)
        rail("R20", f"{side} base", (x, -DEPTH / 2, lower), (x, DEPTH / 2, lower), rail_surface)
        for y in [-y_center, y_center]:
            rail("R20", f"{side} {'front' if y < 0 else 'rear'} leg",
                 (x, y, lower + 10), (x, y, upper - 10), rail_surface)
            cuboid("Rubber foot", (x, y, 1.75), (17, 19, 3.5), surfaces["rubber"], 0.65)
            outer_x = x + 9.48 * sign
            for tip, root in [(715, 725), (38, 28)]:
                clamp("A20 · corner clamp", (outer_x, y, root), (outer_x, y, tip),
                      (sign, 0, 0), 16, surfaces)
        for y in [-350, -125, 125, 350]:
            screw((x + 9.55 * sign, y, upper), (sign, 0, 0), 3.9, surfaces)
        x -= 3.1 * sign
        start, end = (x, -y_center + 15, 680), (x, y_center - 15, 76)
        rail("R10", f"{side} diagonal", start, end, rail_surface, (1, 0, 0))
        for point, y in [(start, -y_center), (end, y_center)]:
            clamp("A10 · side brace clamp", (x + 5.1 * sign, point[1], point[2]),
                  (x + 5.1 * sign, y, point[2]), (sign, 0, 0), 11, surfaces)

    middle = Vector((0, y_center, 378))
    for end in [(s * (x_center - 15), y_center, h) for s in [-1, 1] for h in [76, 680]]:
        direction = (Vector(end) - middle).normalized()
        rail("R10", "Rear diagonal", middle + 12 * direction, end, rail_surface, (0, 1, 0))
        clamp("A10 · rear brace clamp", (end[0], y_center + 5.1, end[2]),
              (math.copysign(x_center, end[0]), y_center + 5.1, end[2]), (0, 1, 0), 11, surfaces)
    for elevation in [-1, 1]:
        direction = Vector((x_center - 15, 0, elevation * 302)).normalized()
        start, end = middle - direction * 13, middle + direction * 13
        offset = Vector((0, elevation * 5.2, 0))
        outward = Vector((0, elevation, 0))
        clamp("XR10 · centre cross", start + offset, end + offset, outward, 9, surfaces)
        screw(start + offset + outward * 0.24, outward, 2.9, surfaces)


def aim(obj, target):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat("-Z", "Y").to_euler()


def render_poster(path):
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.samples = 32
    scene.cycles.use_denoising = True
    scene.render.film_transparent = True
    scene.render.resolution_x = 1200
    scene.render.resolution_y = 960
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "WEBP"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.image_settings.quality = 88
    scene.render.filepath = str(path)
    scene.world = bpy.data.worlds.new("Studio ambient")
    scene.world.use_nodes = True
    ambient = scene.world.node_tree.nodes.get("Background")
    ambient.inputs[0].default_value = (0.82, 0.87, 1.0, 1)
    ambient.inputs[1].default_value = 0.35
    scene.view_settings.view_transform = "AgX"
    bpy.ops.mesh.primitive_plane_add(size=200, location=(0, 0, -0.0002))
    bpy.context.object.is_shadow_catcher = True
    bpy.ops.object.camera_add(location=(1.47, -2.02, 1.35))
    camera = bpy.context.object
    camera.data.sensor_fit = "VERTICAL"
    camera.data.lens = camera.data.sensor_height / (2 * math.tan(math.radians(16)))
    aim(camera, (0, 0, 0.315))
    scene.camera = camera
    for at, power, width, height in [
        ((-1.6, -2.1, 3.4), 340, 2.9, 1.8),
        ((2.0, 0.4, 2.35), 240, 1.5, 2.5),
        ((-0.3, 2.2, 2.6), 320, 2.7, 0.7),
    ]:
        bpy.ops.object.light_add(type="AREA", location=at)
        light = bpy.context.object
        light.data.energy = power
        light.data.shape = "RECTANGLE"
        light.data.size = width
        light.data.size_y = height
        aim(light, (0, 0, 0.45))
    bpy.ops.render.render(write_still=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path,
                        default=Path(__file__).resolve().parents[1] / "src" / "assets")
    parser.add_argument("--poster", action="store_true")
    args = parser.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else [])
    args.output.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    build_desk()
    bpy.ops.export_scene.gltf(filepath=str(args.output / "field-desk.glb"),
                             export_format="GLB", export_image_format="AUTO")
    if args.poster:
        render_poster(args.output / "field-desk.webp")


if __name__ == "__main__":
    main()
