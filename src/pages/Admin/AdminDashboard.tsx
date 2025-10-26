import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Heading,
  Input,
  Text,
  HStack,
  Badge,
  Tabs,
  Table,
  IconButton,
} from "@chakra-ui/react";
import { MdDelete, MdBlock, MdSearch, MdRefresh } from "react-icons/md";
import { toaster } from "@/components/ui/toaster";
import NavBar from "@/components/general/NavBar/NavBar";

// API base URL - use relative URL in dev, full URL in production
const API_BASE_URL = import.meta.env.DEV
  ? "/api/admin"
  : "https://rayquiza-backend.onrender.com/api/admin";

interface User {
  _id: string;
  name: string;
  email: string;
  googleId?: string;
  createdAt: string;
  banned?: boolean;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  code: string;
  createdBy: string;
  createdByEmail: string;
  categories: string[];
  questions: any[];
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  totalQuizzes: number;
  bannedUsers: number;
  quizzesToday: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        toaster.create({
          title: "Access Denied",
          description: "Please login first",
          type: "error",
        });
        navigate("/login");
        return;
      }

      const user = JSON.parse(storedUser);
      const response = await fetch(`${API_BASE_URL}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, userId: user._id }),
      });

      if (response.ok) {
        setIsAdmin(true);
        fetchData();
      } else {
        toaster.create({
          title: "Access Denied",
          description: "You don't have admin privileges",
          type: "error",
        });
        navigate("/");
      }
    } catch (error) {
      console.error("Admin check error:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;

      const user = JSON.parse(storedUser);
      const queryParams = `?email=${encodeURIComponent(user.email)}&userId=${
        user._id
      }`;

      const [usersRes, quizzesRes, statsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/users${queryParams}`),
        fetch(
          `${API_BASE_URL}/quizzes?email=${encodeURIComponent(user.email)}`
        ),
        fetch(`${API_BASE_URL}/stats?email=${encodeURIComponent(user.email)}`),
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      if (quizzesRes.ok) setQuizzes(await quizzesRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const handleBanUser = async (userId: string, banned: boolean) => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;
      const user = JSON.parse(storedUser);

      const response = await fetch(`${API_BASE_URL}/users/${userId}/ban`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banned, email: user.email }),
      });

      if (response.ok) {
        toaster.create({
          title: banned ? "User Banned" : "User Unbanned",
          type: "success",
        });
        fetchData();
      }
    } catch (error) {
      toaster.create({
        title: "Error",
        description: "Failed to update user status",
        type: "error",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;
      const user = JSON.parse(storedUser);

      const response = await fetch(
        `${API_BASE_URL}/users/${userId}?email=${encodeURIComponent(
          user.email
        )}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        toaster.create({
          title: "User Deleted",
          type: "success",
        });
        fetchData();
      }
    } catch (error) {
      toaster.create({
        title: "Error",
        description: "Failed to delete user",
        type: "error",
      });
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return;

    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;
      const user = JSON.parse(storedUser);

      const response = await fetch(
        `${API_BASE_URL}/quizzes/${quizId}?email=${encodeURIComponent(
          user.email
        )}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        toaster.create({
          title: "Quiz Deleted",
          type: "success",
        });
        fetchData();
      }
    } catch (error) {
      toaster.create({
        title: "Error",
        description: "Failed to delete quiz",
        type: "error",
      });
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredQuizzes = quizzes.filter(
    (quiz) =>
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.createdBy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Box p={8} textAlign="center">
        <Text>Loading...</Text>
      </Box>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <NavBar />
      <Box p={{ base: 4, md: 8 }} maxW="1400px" mx="auto">
        <HStack justifyContent="space-between" mb={6} flexWrap="wrap" gap={4}>
          <Heading size={{ base: "xl", md: "2xl" }}>🛡️ Admin Dashboard</Heading>
          <Button
            onClick={fetchData}
            variant="outline"
            size={{ base: "sm", md: "md" }}
          >
            <MdRefresh /> Refresh
          </Button>
        </HStack>

        {/* Stats Cards */}
        {stats && (
          <HStack mb={8} gap={4} wrap="wrap">
            <Box
              bg="blue.500"
              color="white"
              p={{ base: 4, md: 6 }}
              borderRadius="lg"
              flex={1}
              minW={{ base: "140px", md: "200px" }}
            >
              <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold">
                {stats.totalUsers}
              </Text>
              <Text fontSize={{ base: "sm", md: "md" }}>Total Users</Text>
            </Box>
            <Box
              bg="green.500"
              color="white"
              p={{ base: 4, md: 6 }}
              borderRadius="lg"
              flex={1}
              minW={{ base: "140px", md: "200px" }}
            >
              <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold">
                {stats.totalQuizzes}
              </Text>
              <Text fontSize={{ base: "sm", md: "md" }}>Total Quizzes</Text>
            </Box>
            <Box
              bg="red.500"
              color="white"
              p={{ base: 4, md: 6 }}
              borderRadius="lg"
              flex={1}
              minW={{ base: "140px", md: "200px" }}
            >
              <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold">
                {stats.bannedUsers}
              </Text>
              <Text fontSize={{ base: "sm", md: "md" }}>Banned Users</Text>
            </Box>
            <Box
              bg="purple.500"
              color="white"
              p={{ base: 4, md: 6 }}
              borderRadius="lg"
              flex={1}
              minW={{ base: "140px", md: "200px" }}
            >
              <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold">
                {stats.quizzesToday}
              </Text>
              <Text fontSize={{ base: "sm", md: "md" }}>Quizzes Today</Text>
            </Box>
          </HStack>
        )}

        {/* Search Bar */}
        <HStack mb={6} gap={2}>
          <Input
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size={{ base: "md", md: "lg" }}
          />
          <IconButton aria-label="Search" size={{ base: "md", md: "lg" }}>
            <MdSearch />
          </IconButton>
        </HStack>

        {/* Tabs */}
        <Tabs.Root
          value={activeTab}
          onValueChange={(e) => setActiveTab(e.value)}
        >
          <Tabs.List>
            <Tabs.Trigger value="users">Users ({users.length})</Tabs.Trigger>
            <Tabs.Trigger value="quizzes">
              Quizzes ({quizzes.length})
            </Tabs.Trigger>
          </Tabs.List>

          {/* Users Tab */}
          <Tabs.Content value="users">
            <Box mt={4} overflowX="auto">
              <Table.Root size="sm">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Name</Table.ColumnHeader>
                    <Table.ColumnHeader>Email</Table.ColumnHeader>
                    <Table.ColumnHeader>Joined</Table.ColumnHeader>
                    <Table.ColumnHeader>Status</Table.ColumnHeader>
                    <Table.ColumnHeader>Actions</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filteredUsers.map((user) => (
                    <Table.Row key={user._id}>
                      <Table.Cell>{user.name}</Table.Cell>
                      <Table.Cell>{user.email}</Table.Cell>
                      <Table.Cell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </Table.Cell>
                      <Table.Cell>
                        {user.banned ? (
                          <Badge colorPalette="red">Banned</Badge>
                        ) : (
                          <Badge colorPalette="green">Active</Badge>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <HStack gap={2}>
                          <IconButton
                            aria-label={user.banned ? "Unban" : "Ban"}
                            size="sm"
                            colorPalette={user.banned ? "green" : "orange"}
                            onClick={() =>
                              handleBanUser(user._id, !user.banned)
                            }
                          >
                            <MdBlock />
                          </IconButton>
                          <IconButton
                            aria-label="Delete"
                            size="sm"
                            colorPalette="red"
                            onClick={() => handleDeleteUser(user._id)}
                          >
                            <MdDelete />
                          </IconButton>
                        </HStack>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>
          </Tabs.Content>

          {/* Quizzes Tab */}
          <Tabs.Content value="quizzes">
            <Box mt={4} overflowX="auto">
              <Table.Root size="sm">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Title</Table.ColumnHeader>
                    <Table.ColumnHeader>Code</Table.ColumnHeader>
                    <Table.ColumnHeader>Creator</Table.ColumnHeader>
                    <Table.ColumnHeader>Questions</Table.ColumnHeader>
                    <Table.ColumnHeader>Created</Table.ColumnHeader>
                    <Table.ColumnHeader>Actions</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filteredQuizzes.map((quiz) => (
                    <Table.Row key={quiz._id}>
                      <Table.Cell fontWeight="bold">{quiz.title}</Table.Cell>
                      <Table.Cell>
                        <Badge colorPalette="blue">{quiz.code}</Badge>
                      </Table.Cell>
                      <Table.Cell>
                        {quiz.createdBy}
                        <br />
                        <Text fontSize="xs" color="gray.500">
                          {quiz.createdByEmail}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>{quiz.questions?.length || 0}</Table.Cell>
                      <Table.Cell>
                        {new Date(quiz.createdAt).toLocaleDateString()}
                      </Table.Cell>
                      <Table.Cell>
                        <IconButton
                          aria-label="Delete"
                          size="sm"
                          colorPalette="red"
                          onClick={() => handleDeleteQuiz(quiz._id)}
                        >
                          <MdDelete />
                        </IconButton>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>
          </Tabs.Content>
        </Tabs.Root>
      </Box>
    </>
  );
};

export default AdminDashboard;
