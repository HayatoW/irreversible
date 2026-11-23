// Adapted from Glyph by Jesper Landberg (MIT). See public/licenses/Glyph.txt.
export const coverage = /* wgsl */ `
	/*
	 * Coverage along one ray from p, cast in +x. For the vertical ray the
	 * caller hands in swapped coordinates, so the same solve runs in +y.
	 */
	fn ray(p: vec2f, ppx: f32, band: u32, swapAxes: bool) -> f32 {
		var cov = 0.0;

		let h = curves[band];
		let offset = u32(h.x + 0.5);
		let count = u32(h.y + 0.5);

		let cut = -0.5 / ppx;

		for (var i = 0u; i < count; i++) {
			let ix = curves[offset + (i >> 2u)];
			let c = u32(ix[i & 3u] + 0.5);

			let a = curves[c * 2u];
			let b = curves[c * 2u + 1u].xy;

			let p0 = select(a.xy, a.yx, swapAxes) - p;
			let p1 = select(a.zw, a.wz, swapAxes) - p;
			let p2 = select(b, b.yx, swapAxes) - p;

			if (max(p0.x, max(p1.x, p2.x)) < cut) { break; }

			/* which of the two roots are real crossings, from which side of
			   the ray the three control points lie */
			let code = (0x2E74u >> (select(0u, 2u, p0.y > 0.0) + select(0u, 4u, p1.y > 0.0) + select(0u, 8u, p2.y > 0.0))) & 3u;
			if (code == 0u) { continue; }

			let ca = p0 - p1 * 2.0 + p2;
			let cb = p0 - p1;

			var t1: f32;
			var t2: f32;
			if (abs(ca.y) < 1e-5) {
				t1 = p0.y * 0.5 / cb.y;
				t2 = t1;
			} else {
				let ra = 1.0 / ca.y;
				let d = sqrt(max(cb.y * cb.y - ca.y * p0.y, 0.0));
				t1 = (cb.y - d) * ra;
				t2 = (cb.y + d) * ra;
			}

			if ((code & 1u) != 0u) {
				let x = (ca.x * t1 - cb.x * 2.0) * t1 + p0.x;
				cov += clamp(x * ppx + 0.5, 0.0, 1.0);
			}
			if (code > 1u) {
				let x = (ca.x * t2 - cb.x * 2.0) * t2 + p0.x;
				cov -= clamp(x * ppx + 0.5, 0.0, 1.0);
			}
		}

		return cov;
	}

	/* antiderivative of clamp(u, 0, 1) */
	fn F(u: f32) -> f32 {
		if (u < 0.0) { return 0.0; }
		if (u < 1.0) { return 0.5 * u * u; }
		return u - 0.5;
	}

	/*
	 * Signed coverage a segment contributes to the unit pixel centred on the
	 * origin: the area to the LEFT of the segment inside the pixel, signed by
	 * the segment's direction. Exact for a line.
	 *
	 * y0/y1 bound the SLICE of the pixel being integrated, in pixel units.
	 * The whole pixel is (-0.5, 0.5); a narrower range is what lets one pixel
	 * be assembled from more than one band without counting a curve listed in
	 * both twice.
	 */
	fn seg(a: vec2f, b: vec2f, y0: f32, y1: f32) -> f32 {
		let dy = b.y - a.y;
		if (abs(dy) < 1e-7) { return 0.0; }

		let t0 = (y0 - a.y) / dy;
		let t1 = (y1 - a.y) / dy;
		let lo = clamp(min(t0, t1), 0.0, 1.0);
		let hi = clamp(max(t0, t1), 0.0, 1.0);
		if (hi <= lo) { return 0.0; }

		let A = mix(a, b, lo);
		let B = mix(a, b, hi);
		let d = B.y - A.y;

		let u0 = A.x + 0.5;
		let u1 = B.x + 0.5;

		if (abs(u1 - u0) < 1e-5) { return clamp(u0, 0.0, 1.0) * d; }
		return (F(u1) - F(u0)) / (u1 - u0) * d;
	}

	/* exact-area coverage over one band's slice of the pixel. px = pixels per
	   em each way; y0/y1 the slice, in pixel units about the centre */
	fn area(p: vec2f, px: vec2f, band: u32, y0: f32, y1: f32) -> f32 {
		var cov = 0.0;

		let h = curves[band];
		let offset = u32(h.x + 0.5);
		let count = u32(h.y + 0.5);

		let cut = -0.5 / px.x;
		let loY = y0 / px.y;
		let hiY = y1 / px.y;

		for (var i = 0u; i < count; i++) {
			let ix = curves[offset + (i >> 2u)];
			let c = u32(ix[i & 3u] + 0.5);

			let a = curves[c * 2u];
			let b = curves[c * 2u + 1u].xy;

			var p0 = a.xy - p;
			var p1 = a.zw - p;
			var p2 = b - p;

			if (max(p0.x, max(p1.x, p2.x)) < cut) { break; }

			let ymin = min(p0.y, min(p1.y, p2.y));
			let ymax = max(p0.y, max(p1.y, p2.y));
			if (ymax < loY || ymin > hiY) { continue; }

			p0 *= px;
			p1 *= px;
			p2 *= px;

			/* segments from the curve's on-screen bend: a straight line
			   (degenerate quadratic) is one. Flattening a quadratic into n
			   chords is off by at most |p0 - 2p1 + p2| / 8n², so this n keeps
			   it under a quarter pixel — a few at text sizes, the cap of 32
			   only when a glyph is zoomed to thousands of pixels an em, and
			   only for the curves that cross this pixel's row at all */
			let dd = p0 - 2.0 * p1 + p2;
			let n = u32(clamp(ceil(sqrt(length(dd) * 0.5)), 1.0, 32.0));

			var prev = p0;
			for (var k = 1u; k <= n; k++) {
				let s = f32(k) / f32(n);
				let q = mix(mix(p0, p1, s), mix(p1, p2, s), s);
				cov += seg(prev, q, y0, y1);
				prev = q;
			}
		}

		return cov;
	}

	/*
	 * A glyph's coverage at em point p. table/bands from the glyph entry,
	 * bbox its ink box, ppx/ppy pixels per em.
	 */
	fn coverage(p: vec2f, ppx: f32, ppy: f32, table: u32, bands: i32, bbox: vec4f, slug: bool) -> f32 {
		if (!slug) {
			/*
			 * EVERY BAND THE PIXEL TOUCHES, not just the one its centre is in.
			 *
			 * A curve is listed in the bands its control polygon overlaps —
			 * membership for a POINT — but this integrates over a whole pixel.
			 * Picking the band from the centre misses any curve lying wholly in
			 * the next band but within half a pixel of the boundary: one pixel
			 * row short, straight across the glyph, worst on round letters where
			 * the outline runs flat near the top of a bowl and a whole curve
			 * fits in one thin band.
			 *
			 * So the pixel is assembled from its bands, each integrated over
			 * only its own slice. The first and last slices open out to the
			 * pixel's edge, or the AA pad past the ink box would integrate an
			 * empty range and lose its edge. Nearly always one band, two at a
			 * boundary.
			 */
			let span = max(bbox.w - bbox.y, 1e-6);
			let fy = (p.y - bbox.y) / span * f32(bands);
			let hb = (0.5 / ppy) / span * f32(bands);

			let lo = clamp(i32(floor(fy - hb)), 0, bands - 1);
			let hi = clamp(i32(floor(fy + hb)), 0, bands - 1);

			var acc = 0.0;
			for (var b = lo; b <= hi; b++) {
				let e0 = select((f32(b) - fy) / f32(bands) * span * ppy, -0.5, b == 0);
				let e1 = select((f32(b + 1) - fy) / f32(bands) * span * ppy, 0.5, b == bands - 1);

				acc += area(p, vec2f(ppx, ppy), table + u32(b), max(e0, -0.5), min(e1, 0.5));
			}

			return clamp(abs(acc), 0.0, 1.0);
		}

		/* band picking goes through i32 before clamping: a fragment in the AA
		   pad computes a NEGATIVE fraction, and f32→u32 of that is undefined */
		let bh = u32(clamp(i32((p.y - bbox.y) / max(bbox.w - bbox.y, 1e-6) * f32(bands)), 0, bands - 1));
		let bv = u32(clamp(i32((p.x - bbox.x) / max(bbox.z - bbox.x, 1e-6) * f32(bands)), 0, bands - 1));

		let h = ray(p, ppx, table + bh, false);
		let v = ray(p.yx, ppy, table + u32(bands) + bv, true);

		return clamp((abs(h) + abs(v)) * 0.5, 0.0, 1.0);
	}
`;
