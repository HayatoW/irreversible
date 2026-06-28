import {
  Box,
  Container,
  Heading,
  Link as ChakraLink,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { blogs } from "../lib/blogs";

export const Route = createFileRoute("/")({ component: App });
const LATEST_BLOGS_LIMIT = 4;

function App() {
  const latestBlogs = blogs.slice(0, LATEST_BLOGS_LIMIT);

  return (
    <Box as="main" px="4" pb="8" pt="14">
      <Container maxW="container.lg">
        <Box
          position="relative"
          overflow="hidden"
          rounded="3xl"
          px={{ base: "6", sm: "10" }}
          py={{ base: "10", sm: "14" }}
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
            mb="3"
          >
            blog
          </Text>
          <Heading
            as="h1"
            size={{ base: "3xl", sm: "5xl" }}
            fontFamily="'Fraunces', Georgia, serif"
            fontWeight="bold"
            mb="5"
            maxW="3xl"
          >
            Irreversible
          </Heading>
          <Text maxW="2xl" fontSize={{ base: "md", sm: "lg" }} color="fg.muted" mb="8">
            Hello Friend. I build software and share my place with two cats. When I'm not coding,
            I'm usually listening to These New Puritans or Nils Frahm, or thinking about
            design—especially ACRNM's take on function and form.
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="4" mt="8">
          {latestBlogs.map((post) => (
            <Box
              key={post.slug}
              as="article"
              p="5"
              rounded="2xl"
              borderWidth="1px"
              borderColor="border.subtle"
              bg="bg.subtle"
              transition="transform 0.2s"
              _hover={{ transform: "translateY(-2px)" }}
            >
              <Stack gap="2">
                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  letterSpacing="wider"
                  textTransform="uppercase"
                  color="purple.500"
                >
                  {post.publishedAt}
                </Text>
                <Heading as="h2" fontSize="md" fontWeight="semibold">
                  <ChakraLink asChild _hover={{ textDecoration: "underline" }}>
                    <Link to="/blog/$slug" params={{ slug: post.slug }}>
                      {post.title}
                    </Link>
                  </ChakraLink>
                </Heading>
                <Text fontSize="sm" color="fg.muted">
                  {post.summary}
                </Text>
              </Stack>
            </Box>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}
