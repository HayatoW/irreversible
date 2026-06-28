import {
  Box,
  Container,
  Flex,
  HStack,
  IconButton,
  Link as ChakraLink,
  Text,
} from "@chakra-ui/react";
import { Link } from "@tanstack/react-router";
import { ColorModeButton } from "./ui/color-mode";

function XIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" width="20" height="20">
      <path
        fill="currentColor"
        d="M12.6 1h2.2L10 6.48 15.64 15h-4.41L7.78 9.82 3.23 15H1l5.14-5.84L.72 1h4.52l3.12 4.73L12.6 1zm-.77 12.67h1.22L4.57 2.26H3.26l8.57 11.41z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" width="20" height="20">
      <path
        fill="currentColor"
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"
      />
    </svg>
  );
}

export default function Header() {
  return (
    <Box
      as="header"
      position="sticky"
      top="0"
      zIndex="50"
      borderBottomWidth="1px"
      borderColor="border.subtle"
      bg="bg/80"
      backdropFilter="blur(12px)"
      px="4"
    >
      <Container maxW="container.lg" py={{ base: "3", sm: "4" }}>
        <Flex wrap="wrap" align="center" gap={{ base: "2", sm: "3" }}>
          <Text as="h2" fontSize="sm" fontWeight="semibold" flexShrink={0}>
            <Link to="/" style={{ textDecoration: "none" }}>
              <HStack
                gap="2"
                px={{ base: "3", sm: "4" }}
                py={{ base: "1.5", sm: "2" }}
                rounded="full"
                borderWidth="1px"
                borderColor="border.subtle"
                bg="bg.subtle"
                shadow="sm"
              >
                <Box w="2" h="2" rounded="full" bg="purple.400" />
                <Text color="fg.default">Irreversible</Text>
              </HStack>
            </Link>
          </Text>

          <HStack gap={{ base: "1", sm: "2" }} ml={{ base: "auto", sm: "0" }}>
            <IconButton
              asChild
              variant="ghost"
              size="sm"
              aria-label="Follow on X"
              display={{ base: "none", sm: "flex" }}
            >
              <a href="https://x.com/nabecmdctrl" target="_blank" rel="noreferrer">
                <XIcon />
              </a>
            </IconButton>
            <IconButton
              asChild
              variant="ghost"
              size="sm"
              aria-label="GitHub"
              display={{ base: "none", sm: "flex" }}
            >
              <a href="https://github.com/HayatoW" target="_blank" rel="noreferrer">
                <GitHubIcon />
              </a>
            </IconButton>
            <ColorModeButton />
          </HStack>

          <HStack
            order={{ base: 3, sm: 2 }}
            w={{ base: "full", sm: "auto" }}
            gap="4"
            pb={{ base: "1", sm: "0" }}
            fontSize="sm"
            fontWeight="semibold"
          >
            <ChakraLink asChild color="fg.muted" _hover={{ color: "fg.default" }}>
              <Link to="/">Home</Link>
            </ChakraLink>
            <ChakraLink asChild color="fg.muted" _hover={{ color: "fg.default" }}>
              <Link to="/blog">Blog</Link>
            </ChakraLink>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}
