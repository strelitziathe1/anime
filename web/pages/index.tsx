import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from '../contexts/ThemeContext';
import Navbar from '../components/Navbar';
import CharacterBrowser from '../components/CharacterBrowser';
import LoadingSpinner from '../components/LoadingSpinner';

const HomePage: React.FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setLoading(false);

    // If not logged in, redirect to login
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: theme.colors.background,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: theme.colors.background, minHeight: '100vh' }}>
      <Navbar />
      <main
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '40px 20px',
        }}
      >
        <h1
          style={{
            color: theme.colors.text,
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '10px',
          }}
        >
          Welcome to AnimeStream
        </h1>
        <p
          style={{
            color: theme.colors.text,
            opacity: 0.7,
            marginBottom: '30px',
            fontSize: '16px',
          }}
        >
          Explore 280+ anime characters with custom themes and discover new favorites
        </p>

        {/* Character Browser */}
        <CharacterBrowser />
      </main>
    </div>
  );
};

export default HomePage;
