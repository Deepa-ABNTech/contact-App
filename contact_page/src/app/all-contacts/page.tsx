'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useDisclosure,
  Avatar,
  Flex,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import Layout from '../components/Layout';
import { fetchApi } from '../utils/api';
import CreateContactModal from '../components/CreateContactModal';
import EditContactModal from '../components/EditContactModal';
import SearchContact from '../components/SearchContact';

export default function Page() {
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const tableRef = useRef(null);
  useEffect(() => {
    fetchContacts(true);
  }, []);

  useEffect(() => {
    const currentTableRef = tableRef.current;
    if (currentTableRef) {
      currentTableRef.addEventListener('scroll', handleScroll);
      return () => currentTableRef.removeEventListener('scroll', handleScroll);
    }
  }, [tableRef.current]);

  const fetchContacts = async (isInitial = false) => {
    if (isLoading || (!isInitial && !hasMore)) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await fetchApi(`/contact?page=${isInitial ? 1 : page}`);
      setContacts(prevContacts => {
        const newContacts = isInitial ? response : [...prevContacts, ...response];
        return Array.from(new Set(newContacts.map(contact => contact.id)))
          .map(id => newContacts.find(contact => contact.id === id));
      });
      if (!isInitial) {
        setPage(page + 1);
      }
      setHasMore(response.length > 0);
    } catch (error) {
      console.error('Fetch contacts error:', error);
      setError('Error fetching contacts. Please try again.');
    } finally {
      setIsLoading(false);
      if (isInitial) {
        setIsInitialLoading(false);
      }
    }
  };

  const handleCreateContact = async (newContact) => {
    setContacts([...contacts, newContact]);
  };

  const handleUpdateContact = (updatedContact) => {
    setContacts(contacts.map(contact => 
      contact.id === updatedContact.id ? updatedContact : contact
    ));
  };

  const handleEdit = (contact) => {
    setSelectedContact(contact);
    onEditOpen();
  };

  const handleDelete = async (id) => {
    setIsLoading(true);
    setError('');
    try {
      await fetchApi(`/contact/${id}`, { method: 'DELETE' });
      setContacts(contacts.filter(contact => contact.id !== id));
    } catch (error) {
      setError('Error deleting contact. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchResult = (result) => {
    setSearchResult(result);
  };

  const handleScroll = () => {
    const { scrollTop, clientHeight, scrollHeight } = tableRef.current;
    if (scrollTop + clientHeight >= scrollHeight && !isLoading && hasMore) {
      fetchContacts();
    }
  };
  if (isInitialLoading) {
    return (
      <Layout>
        <Center height="100vh">
          <Spinner size="xl" />
        </Center>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box padding="20px">
        <Flex justify="space-between" align="center" mb="20px">
        <SearchContact onSearchResult={handleSearchResult} />
        <Button
          leftIcon={<AddIcon />}
          colorScheme="teal"
          variant="solid"
          onClick={onCreateOpen}
          mt={4}
        >
          New Contact
        </Button>
        </Flex>

        {error && <Box color="red.500" mt={4}>{error}</Box>}

        <Box
          ref={tableRef}
          maxHeight="317px"
          overflowY="auto"
          mt={4}
          onScroll={handleScroll}
        >

        <Table variant="simple" mt={4}>
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>First Name</Th>
              <Th>Last Name</Th>
              <Th>Email</Th>
              <Th>Phone</Th>
              <Th>Avatar</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {(searchResult ? [searchResult] : contacts).map((contact) => (
              <Tr key={contact.id}>
                <Td>{contact.id}</Td>
                <Td>{contact.FirstName}</Td>
                <Td>{contact.LastName}</Td>
                <Td>{contact.Email}</Td>
                <Td>{contact.Phone}</Td>
                <Td>
                  <Avatar
                    size="md"
                    src={contact.PictureUrl}
                    name={`${contact.FirstName} ${contact.LastName}`}
                  />
                </Td>
                <Td>
                  <IconButton
                    icon={<EditIcon />}
                    onClick={() => handleEdit(contact)}
                    aria-label="Edit Contact"
                    mr={2}
                  />
                  <IconButton
                    icon={<DeleteIcon />}
                    onClick={() => handleDelete(contact.id)}
                    aria-label="Delete Contact"
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        {isLoading && !isInitialLoading && (
            <Center p={4}>
              <Spinner />
            </Center>
          )}
        </Box>

        <CreateContactModal
          isOpen={isCreateOpen}
          onClose={onCreateClose}
          onCreateContact={handleCreateContact}
        />

        <EditContactModal
          isOpen={isEditOpen}
          onClose={onEditClose}
          contact={selectedContact}
          onUpdateContact={handleUpdateContact}
        />
      </Box>
    </Layout>
  );
}