import { Box, Container, Heading, Text } from "@chakra-ui/react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import Markdown from "../../components/Markdown";
import { getBlogBySlug } from "../../lib/blogs";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getBlogBySlug(params.slug);
    if (!post) {
      throw notFound();
    }
    return post;
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const post = Route.useLoaderData();

  return (
    <Box as="main" px="4" py="14">
      <Container maxW="container.lg">
        <Box
          as="article"
          rounded="2xl"
          p={{ base: "6", sm: "8" }}
          borderWidth="1px"
          borderColor="border.subtle"
          bg="bg.subtle"
        >
          <Text
            fontSize="xs"
            fontWeight="bold"
            letterSpacing="wider"
            textTransform="uppercase"
            color="purple.500"
            mb="2"
          >
            {post.publishedAt}
          </Text>
          <Heading
            as="h1"
            size={{ base: "3xl", sm: "4xl" }}
            fontFamily="'Fraunces', Georgia, serif"
            fontWeight="bold"
            mb="3"
          >
            {post.title}
          </Heading>
          <Text color="fg.muted" mb="0">
            {post.summary}
          </Text>
          <Box mt="8">
            <Markdown content={post.content} />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
