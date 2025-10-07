import { Box, Text } from "@chakra-ui/react";

interface FieldProps {
  label?: string;
  children: React.ReactNode;
  invalid?: boolean;
  errorText?: string;
  helperText?: string;
}

export const Field = ({
  label,
  children,
  invalid,
  errorText,
  helperText,
}: FieldProps) => {
  return (
    <Box mb={4}>
      {label && (
        <Text
          as="label"
          fontSize="sm"
          fontWeight="medium"
          mb={2}
          display="block"
          color={invalid ? "red.500" : "gray.700"}
        >
          {label}
        </Text>
      )}
      {children}
      {invalid && errorText && (
        <Text fontSize="sm" color="red.500" mt={1}>
          {errorText}
        </Text>
      )}
      {!invalid && helperText && (
        <Text fontSize="sm" color="gray.500" mt={1}>
          {helperText}
        </Text>
      )}
    </Box>
  );
};
