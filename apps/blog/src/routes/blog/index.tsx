import { Box, Container, Heading, Link as ChakraLink, Stack, Text } from "@chakra-ui/react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { blogs } from "../../lib/blogs";

export const Route = createFileRoute("/blog/")({
  component: Blog,
});

function Blog() {
  return (
    <Box as="main" px="4" py="14">
      <Container maxW="container.lg">
        <Stack gap="4">
          {blogs.map((post) => (
            <Box
              key={post.slug}
              as="article"
              rounded="2xl"
              p={{ base: "5", sm: "6" }}
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
              <Heading as="h2" fontSize="2xl" fontWeight="semibold">
                <ChakraLink asChild _hover={{ textDecoration: "underline" }}>
                  <Link to="/blog/$slug" params={{ slug: post.slug }}>
                    {post.title}
                  </Link>
                </ChakraLink>
              </Heading>
              <Text fontSize="sm" lineHeight="tall" color="fg.muted" mt="2">
                {post.summary}
              </Text>
            </Box>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
