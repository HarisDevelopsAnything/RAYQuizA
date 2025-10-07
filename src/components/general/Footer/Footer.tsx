import { useColorModeValue } from "@/components/ui/color-mode";
import { Flex, Link, Text, Container, VStack } from "@chakra-ui/react";

const footerData = [
  {
    label: "Quizzes",
    href: "/quizzes",
    links: [
      { label: "All Quizzes", href: "/quizzes" },
      { label: "Create Quiz", href: "/create" },
      { label: "My Attempts", href: "/profile/attempts" },
      { label: "Leaderboard", href: "/leaderboard" },
    ],
  },
  {
    label: "Resources",
    href: "/docs",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "API Reference", href: "/api" },
      { label: "Tutorials", href: "/tutorials" },
      { label: "Examples", href: "/examples" },
    ],
  },
  {
    label: "Community",
    href: "/community",
    links: [
      { label: "Discord", href: "https://discord.gg/your-server" },
      { label: "Twitter", href: "https://twitter.com/your-handle" },
      { label: "GitHub", href: "https://github.com/your-org/RAYQuizA" },
      { label: "Contribute", href: "/contribute" },
    ],
  },
  {
    label: "About",
    href: "/about",
    links: [
      { label: "About RAYQuizA", href: "/about" },
      { label: "Roadmap", href: "/roadmap" },
      { label: "Support", href: "/support" },
      { label: "Privacy & Terms", href: "/legal" },
    ],
  },
];

// const APP_VERSION = "v1.0.0";

const Footer = () => {
  return (
    <Container maxW="7xl" p={{ base: 5, md: 10 }} borderTop={"1px solid teal"}>
      <VStack alignItems="initial">
        <Flex
          flexWrap="wrap"
          direction={{ base: "column", md: "row" }}
          alignItems="start"
          justifyContent="space-between"
        >
          {footerData.map((data, index) => (
            <Flex key={index} direction="column" mb="3">
              <Link
                fontWeight="500"
                href={data.href}
                color={useColorModeValue("gray.800", "gray.300")}
              >
                {data.label}
              </Link>
              <Flex direction={{ base: "row", md: "column" }}>
                {data.links.map((link, index) => (
                  <Link
                    key={index}
                    padding={1}
                    fontSize={{ base: "sm", sm: "md" }}
                    href="#"
                    mr={{ base: 1, sm: 2, md: 0 }}
                    color="gray.500"
                    _hover={{ color: "blue.600" }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Flex>
            </Flex>
          ))}
        </Flex>
        <Flex alignItems="center">
          <Text color="gray.500" fontSize="0.875rem" pl="0.5rem">
            &copy; 2019 company, Inc. All rights reserved.
          </Text>
        </Flex>
      </VStack>
    </Container>
  );
};

export default Footer;
