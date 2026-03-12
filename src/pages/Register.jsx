import React, { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { Lock, Mail, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { setAuthItems } from '../utils/authStorage';
import './Login.css';

const SITE_KEY = '6Lf4Y2AsAAAAAO42IHyx4h0XbfOb_GctRDW6E89g';

const Register = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [captchaToken, setCaptchaToken] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault();
    if (!username || !email || !password) {
      setError('Fill all fields');
      return;
    }
    if (password !== repeatPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const result = await api.register(username, email, password);
      const user = result.user;
      const payload = {
        authUser: user.role,
        userId: String(user.id),
        username: user.username || '',
        userEmail: user.email || '',
      };
      if (result.token) payload.authToken = result.token;
      setAuthItems(payload, true);
      setError('');
      navigate('/profile');
    } catch {
      setError('Registration failed');
    }
  };

  return (
    <motion.section
      className="login-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="login-bg-glow"></div>
      <div className="container login-container">
        <div className="login-card glass-panel">
          <div className="login-header">
            <h2>Registration</h2>
            <p>{t.hero.subtitle || 'Create your account'}</p>
          </div>

          <form className="login-form" onSubmit={handleRegister}>
            <label className="input-label">
              <span>Login</span>
              <div className="input-wrap">
                <User size={16} />
                <input
                  type="text"
                  placeholder="Username"
                  autoComplete="off"
                  spellCheck="false"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </label>

            <label className="input-label">
              <span>Email</span>
              <div className="input-wrap">
                <Mail size={16} />
                <input
                  type="email"
                  placeholder="name@email.com"
                  autoComplete="off"
                  spellCheck="false"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </label>

            <label className="input-label">
              <span>Password</span>
              <div className="input-wrap">
                <Lock size={16} />
                <input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  spellCheck="false"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </label>

            <label className="input-label">
              <span>Repeat password</span>
              <div className="input-wrap">
                <Lock size={16} />
                <input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  spellCheck="false"
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>
            </label>

            <div className="captcha-wrap">
              <div className="captcha-box">
                <ReCAPTCHA sitekey={SITE_KEY} onChange={setCaptchaToken} theme={theme === 'light' ? 'light' : 'dark'} />
              </div>
            </div>

            {error && <div className="login-error">{error}</div>}

            <button className="btn-hero-primary login-submit" type="submit">
              Register
            </button>

            <div className="login-footer">
              <span>Already have an account?</span>
              <a href="/login">Login</a>
            </div>
          </form>
        </div>
      </div>
    </motion.section>
  );
};

export default Register;
