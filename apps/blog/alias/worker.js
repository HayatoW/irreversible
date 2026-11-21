export default {
  fetch(request, env) {
    return env.BLOG.fetch(request);
  },
};
