// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:3000/api';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect based on role
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else if (data.user.role === 'staff') {
        navigate('/staff');
      } else {
        setError('Invalid user role');
      }
    } catch (error) {
      setError(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <div style={styles.logoSection}>
          <div style={styles.logo}>🍽️</div>
          <h1 style={styles.title}>Restaurant QR Menu</h1>
          <p style={styles.subtitle}>Staff & Admin Login</p>
        </div>

        {error && (
          <div style={styles.error}>
            <span>⚠️ {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              autoFocus
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            style={{
              ...styles.submitButton,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* <div style={styles.credentials}>
          <p style={styles.credentialsTitle}>Demo Credentials:</p>
          <div style={styles.credentialsList}>
            <div style={styles.credentialItem}>
              <strong>Admin:</strong> admin@restaurant.com / admin123
            </div>
            <div style={styles.credentialItem}>
              <strong>Staff:</strong> staff@restaurant.com / staff123
            </div>
          </div>
        </div>*/}
      </div> 
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    padding: '20px'
  },
  loginBox: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '48px',
    width: '100%',
    maxWidth: '450px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
  },
  logoSection: {
    textAlign: 'center',
    marginBottom: '40px'
  },
  logo: {
    fontSize: '64px',
    marginBottom: '16px'
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '28px',
    fontWeight: '800',
    color: '#333'
  },
  subtitle: {
    margin: 0,
    fontSize: '16px',
    color: '#666'
  },
  error: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '14px 20px',
    borderRadius: '10px',
    marginBottom: '24px',
    fontSize: '14px',
    fontWeight: '600'
  },
  form: {
    marginBottom: '32px'
  },
  formGroup: {
    marginBottom: '24px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#333'
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '15px',
    fontFamily: 'inherit',
    transition: 'border-color 0.3s',
    boxSizing: 'border-box'
  },
  submitButton: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s',
    marginTop: '8px'
  },
  credentials: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '12px',
    border: '2px dashed #e0e0e0'
  },
  credentialsTitle: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  credentialsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  credentialItem: {
    fontSize: '14px',
    color: '#333',
    fontFamily: 'monospace',
    backgroundColor: 'white',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #e0e0e0'
  }
};

export default Login;