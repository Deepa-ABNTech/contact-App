// components/SearchContact.js
import React, { useState } from 'react';
import {
  Flex,
  Input,
  IconButton,
  Text,
  Box,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { fetchApi } from '../utils/api';

export default function SearchContact({ onSearchResult }) {
  const [searchId, setSearchId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearchById = async () => {
    setIsLoading(true);
    setError('');

    const numericId = parseInt(searchId, 10);
    if (isNaN(numericId)) {
      setError('ID must be a number');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetchApi(`/contact/${numericId}`);
      onSearchResult(response);
    } catch (error) {
      console.error('Search by ID error:', error);
      setError('Error fetching contact. Please check the ID and try again.');
      onSearchResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Flex>
        <Input
          placeholder="Search by ID"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          marginRight="10px"
        />
        <IconButton
          icon={<SearchIcon />}
          onClick={handleSearchById}
          isLoading={isLoading}
          aria-label="Search Contact"
        />
      </Flex>
      {error && (
        <Text color="red.500" mt={2}>{error}</Text>
      )}
    </Box>
  );
}