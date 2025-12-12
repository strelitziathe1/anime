import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!email.trim()) {
      newErrors.push('Email is required');
    } else if (!email.includes('@')) {
      newErrors.push('Invalid email format');
    }

    if (!password) {
      newErrors.push('Password is required');
    } else if (password.length < 6) {
      newErrors.push('Password must be at least 6 characters');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        addToast(error.message || 'Login failed', 'error');
        return;
      }

      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      addToast('Login successful!', 'success');
      router.push('/account');
    } catch (error) {
      addToast('An error occurred during login', 'error');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: theme.colors.background,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          maxWidth: '400px',
          width: '100%',
        }}
      >
        <Card title="Sign In">
          <div style={{ padding: '30px' }}>
            {/* Header */}
            <h1
              style={{
                textAlign: 'center',
                color: theme.colors.primary,
                marginBottom: '10px',
                fontSize: '28px',
                fontWeight: 'bold',
              }}
            >
              AnimeStream
            </h1>
            <p
              style={{
                textAlign: 'center',
                color: theme.colors.text,
                marginBottom: '30px',
                opacity: 0.7,
              }}
            >
              Sign in to your account
            </p>

            {/* Form */}
            <form onSubmit={handleLogin}>
              {/* Email */}
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: theme.colors.text,
                    fontWeight: '500',
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `2px solid ${theme.colors.border}`,
                    borderRadius: '6px',
                    backgroundColor: theme.colors.inputBg,
                    color: theme.colors.text,
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: theme.colors.text,
                    fontWeight: '500',
                  }}
                >
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `2px solid ${theme.colors.border}`,
                    borderRadius: '6px',
                    backgroundColor: theme.colors.inputBg,
                    color: theme.colors.text,
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Errors */}
              {errors.length > 0 && (
                <div
                  style={{
                    marginBottom: '20px',
                    padding: '12px',
                    backgroundColor: `${theme.colors.error}20`,
                    border: `1px solid ${theme.colors.error}`,
                    borderRadius: '6px',
                  }}
                >
                  {errors.map((error, idx) => (
                    <p
                      key={idx}
                      style={{
                        margin: '0',
                        color: theme.colors.error,
                        fontSize: '14px',
                      }}
                    >
                      • {error}
                    </p>
                  ))}
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: theme.colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  marginBottom: '15px',
                }}
              >
                {loading ? <LoadingSpinner /> : 'Sign In'}
              </button>
            </form>

            {/* Register Link */}
            <p
              style={{
                textAlign: 'center',
                color: theme.colors.text,
                fontSize: '14px',
              }}
            >
              Don't have an account?{' '}
              <Link
                href="/register"
                style={{
                  color: theme.colors.primary,
                  textDecoration: 'none',
                  fontWeight: 'bold',
                }}
              >
                Sign up
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
