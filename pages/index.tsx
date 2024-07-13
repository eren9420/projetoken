import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  TableCell,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableSortLabel,
  Paper,
  Button,
  TextField,
  TablePagination
} from '@mui/material';
import { signIn, useSession } from 'next-auth/react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';

interface Book {
  _id: string;
  title: string;
  price: string;
  availability: string;
}

const Home: NextPage & { auth?: boolean } = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('asc');
  const [valueToOrderBy, setValueToOrderBy] = useState<keyof Book>('title');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(50);
  const [totalBooks, setTotalBooks] = useState<number>(0);

  useEffect(() => {
    if (status === 'loading') return; // Yüklenirken hiçbir şey yapma
    if (!session && status === 'unauthenticated') router.push('/login'); // Kimlik doğrulaması yapılmadıysa yönlendir
  }, [session, status, router]);
  

  const handleRequestSort = (property: keyof Book) => {
    const isAsc = valueToOrderBy === property && orderDirection === 'asc';
    setOrderDirection(isAsc ? 'desc' : 'asc');
    setValueToOrderBy(property);
    setBooks(sortedBooks(books, getComparator(isAsc ? 'desc' : 'asc', property)));
  };

  const handleStockUpdate = async (bookId: string, currentAvailability: string) => {
    try {
      const response = await fetch(`/api/books/${bookId}/update-stock`, {
        method: 'POST'
      });
      if (!response.ok) {
        throw new Error('Failed to update the stock status.');
      }
      const updatedBook = await response.json();
      const newAvailability = currentAvailability.toLowerCase() === 'in stock' ? 'Out of Stock' : 'In Stock';
      setBooks(prevBooks => 
        sortedBooks(
          prevBooks.map(book => book._id === bookId ? { ...book, availability: newAvailability } : book), 
          getComparator(orderDirection, valueToOrderBy)
        )
      );
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const handlePriceUpdate = async (bookId: string) => {
    try {
      const response = await fetch(`/api/books/${bookId}/update-price`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ price: newPrice }),
      });
      if (!response.ok) {
        throw new Error('Failed to update the price.');
      }
      const updatedBook = await response.json();
      setBooks(prevBooks => 
        sortedBooks(
          prevBooks.map(book => book._id === bookId ? { ...book, price: updatedBook.data.price } : book), 
          getComparator(orderDirection, valueToOrderBy)
        )
      );
      setEditingPriceId(null);
      setNewPrice('');
    } catch (error) {
      console.error('Error updating price:', error);
    }
  };

  const getComparator = (
    order: 'asc' | 'desc',
    orderBy: keyof Book
  ): (a: Book, b: Book) => number => {
    return order === 'asc'
      ? (a, b) => (a[orderBy] < b[orderBy] ? -1 : 1)
      : (a, b) => (a[orderBy] > b[orderBy] ? -1 : 1);
  };

  const sortedBooks = (books: Book[], comparator: (a: Book, b: Book) => number) => {
    const stabilizedThis = books.map((el, index) => [el, index] as [Book, number]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  };

  const fetchBooks = async (page: number, rowsPerPage: number) => {
    const res = await fetch(`/api/books?page=${page + 1}&limit=${rowsPerPage}`);
    const data = await res.json();
    setBooks(sortedBooks(data.books, getComparator(orderDirection, valueToOrderBy)));
    setTotalBooks(data.totalBooks);
  };

  useEffect(() => {
    fetchBooks(page, rowsPerPage);
  }, [page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (status === 'unauthenticated') {
    return (
      <Container maxWidth="md">
        <Typography variant="h4" component="h1" gutterBottom>
          Please log in to view the books list.
        </Typography>
        <Button variant="contained" color="primary" onClick={() => signIn('google')}>
          Sign in with Google
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Books List
      </Typography>
      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={valueToOrderBy === 'title'}
                  direction={valueToOrderBy === 'title' ? orderDirection : 'asc'}
                  onClick={() => handleRequestSort('title')}
                >
                  Title
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={valueToOrderBy === 'price'}
                  direction={valueToOrderBy === 'price' ? orderDirection : 'asc'}
                  onClick={() => handleRequestSort('price')}
                >
                  Price
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={valueToOrderBy === 'availability'}
                  direction={valueToOrderBy === 'availability' ? orderDirection : 'asc'}
                  onClick={() => handleRequestSort('availability')}
                >
                  Availability
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {books.map((book) => (
              <TableRow key={book._id}>
                <TableCell component="th" scope="row">
                  {book.title}
                </TableCell>
                <TableCell align="right">
                  {editingPriceId === book._id ? (
                    <TextField
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      size="small"
                    />
                  ) : (
                    book.price
                  )}
                </TableCell>
                <TableCell align="right">{book.availability}</TableCell>
                <TableCell align="right">
                  {book.availability.toLowerCase() === 'in stock' ? (
                    <Button
                      variant="contained"
                      color="secondary"
                      size="small"
                      onClick={() => handleStockUpdate(book._id, book.availability)}
                      style={{ marginLeft: '10px', marginBottom: '5px' }}
                    >
                      Mark as Out of Stock
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleStockUpdate(book._id, book.availability)}
                      style={{ marginLeft: '10px', marginBottom: '5px' }}
                    >
                      Mark as In Stock
                    </Button>
                  )}
                  {editingPriceId === book._id ? (
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handlePriceUpdate(book._id)}
                      style={{ marginLeft: '10px' }}
                    >
                      Save
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => {
                        setEditingPriceId(book._id);
                        setNewPrice(book.price);
                      }}
                      style={{ marginLeft: '10px' }}
                    >
                      Edit Price
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalBooks}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Container>
  );
};

Home.auth = true;

export default Home;
