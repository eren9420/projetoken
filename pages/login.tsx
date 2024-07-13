// pages/login.tsx
import { signIn, signOut, useSession } from 'next-auth/react';
import { Button, Container, Typography } from '@mui/material';

const LoginPage = () => {
  const { data: session } = useSession();

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        {session ? `Welcome, ${session.user?.name}` : 'Please log in'}
      </Typography>
      {session ? (
        <Button variant="contained" color="secondary" onClick={() => signOut()}>
          Sign out
        </Button>
      ) : (
        <Button variant="contained" color="primary" onClick={() => signIn('google')}>
          Sign in with Google
        </Button>
      )}
    </Container>
  );
};

export default LoginPage;
