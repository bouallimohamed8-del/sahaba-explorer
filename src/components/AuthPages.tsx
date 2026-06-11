/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Globe, Shield, Mail, Lock, User, KeyRound, Sparkles, RefreshCw, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Facebook } from 'lucide-react';

interface AuthPagesProps {
  isArabic: boolean;
  isDarkMode: boolean;
  onSuccess?: () => void;
}

export default function AuthPages({ isArabic, isDarkMode, onSuccess }: AuthPagesProps) {
  const {
    loading,
    error,
    isEmailSent,
    registerWithEmail,
    loginWithEmail,
    signInWithGoogle,
    signInWithFacebook,
    resetPassword,
    clearError
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password' | 'email_sent'>('login');
  
  // Registration States
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [regError, setRegError] = useState<string | null>(null);

  // Login States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Password reset state
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  // State handlers
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    clearError();

    if (!registerName.trim() || !registerEmail.trim() || !registerPassword || !registerConfirmPassword) {
      setRegError(isArabic ? 'الرجاء ملء جميع الحقول المطلوبة.' : 'Please fill all required fields.');
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setRegError(isArabic ? 'كلمتا المرور غير متطابقتين.' : 'Passwords do not match.');
      return;
    }

    if (registerPassword.length < 6) {
      setRegError(isArabic ? 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.' : 'Password must be at least 6 characters.');
      return;
    }

    await registerWithEmail(registerEmail, registerPassword, registerName);
    if (!error && !regError) {
      setMode('email_sent');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setRegError(null);

    if (!loginEmail.trim() || !loginPassword) {
      setRegError(isArabic ? 'رجاءً أدخل البريد السري وكلمة المرور.' : 'Please enter email and password.');
      return;
    }

    await loginWithEmail(loginEmail, loginPassword);
    if (!error && onSuccess) {
      onSuccess();
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setRegError(null);
    setResetSuccess(null);

    if (!resetEmail.trim()) {
      setRegError(isArabic ? 'الرجاء إدخال البريد الإلكتروني.' : 'Please enter your email.');
      return;
    }

    await resetPassword(resetEmail);
    if (!error) {
      setResetSuccess(
        isArabic
          ? 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.'
          : 'Password reset link sent to your email.'
      );
    }
  };

  const handleSocialGoogle = async () => {
    clearError();
    setRegError(null);
    await signInWithGoogle();
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleSocialFacebook = async () => {
    clearError();
    setRegError(null);
    await signInWithFacebook();
    if (onSuccess) {
      onSuccess();
    }
  };

  const changeMode = (newMode: 'login' | 'register' | 'forgot_password') => {
    setMode(newMode);
    clearError();
    setRegError(null);
    setResetSuccess(null);
  };

  return (
    <div className="max-w-md mx-auto my-12 animate-fade-in" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className={`p-8 border rounded-3xl shadow-xl transition duration-300 ${
        isDarkMode 
          ? 'bg-natural-dark-panel border-neutral-800 text-slate-100' 
          : 'bg-white/95 border-natural-accent/30 text-natural-text'
      }`}>
        
        {/* Header decoration */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 bg-natural-accent rounded-sm rotate-45 flex items-center justify-center shadow-md mb-6">
            <div className="w-10 h-10 border border-white/50 rotate-45 flex items-center justify-center font-serif text-white text-base">
              ﷺ
            </div>
          </div>
          
          <h2 className="text-2xl font-serif font-bold text-natural-brand">
            {mode === 'login' && (isArabic ? 'تسجيل الدخول للموسوعة' : 'Lexicon Access Login')}
            {mode === 'register' && (isArabic ? 'إنشاء حساب جديد' : 'Register New Account')}
            {mode === 'forgot_password' && (isArabic ? 'استعادة كلمة المرور' : 'Retrieve Credentials')}
            {mode === 'email_sent' && (isArabic ? 'تفعيل البريد الإلكتروني' : 'Verify Email Account')}
          </h2>
          <p className="text-xs text-natural-accent mt-1.5 font-sans">
            {mode === 'login' && (isArabic ? 'مرحباً بك مجدداً في رحاب سيرة الصحابة الفضلاء' : 'Welcome back to the sanctuary of Prophet\'s companions')}
            {mode === 'register' && (isArabic ? 'انضم إلينا لتدوين وبحث التراث الإسلامي الشريف' : 'Join us to document and explore the honorable Islamic heritage')}
            {mode === 'forgot_password' && (isArabic ? 'أدخل بريدك الإلكتروني وسنرسل لك رابط الاستعادة' : 'Enter registered email to recover account')}
            {mode === 'email_sent' && (isArabic ? 'خطوة أخيرة لتأكيد حيازة الحساب والتفعيل' : 'One last step to confirm and activate your account')}
          </p>
        </div>

        {/* Display System or Validation Errors */}
        {(error || regError) && (
          <div className="mb-5 p-4 rounded-xl border bg-red-500/5 border-red-500/20 text-red-500 text-xs flex gap-2.5 items-start">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              {regError || error}
            </div>
          </div>
        )}

        {/* Display Success messages */}
        {resetSuccess && (
          <div className="mb-5 p-4 rounded-xl border bg-emerald-500/5 border-emerald-500/25 text-emerald-600 text-xs flex gap-2.5 items-start" dir={isArabic ? 'rtl' : 'ltr'}>
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
            <div className="leading-relaxed font-sans">{resetSuccess}</div>
          </div>
        )}

        {/* 1. LOGIN MODE */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 text-xs font-sans">
            <div>
              <label className="block text-natural-brand/80 font-bold mb-1.5">
                {isArabic ? 'البريد السري الإلكتروني' : 'Secure Email Address'}
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="example@domain.com"
                  className={`w-full border rounded-xl p-3 pl-10 pr-4 focus:outline-none focus:border-natural-brand transition ${
                    isDarkMode ? 'bg-natural-dark-bg border-neutral-750 text-slate-200' : 'bg-white border-natural-accent/40 text-natural-text'
                  }`}
                  style={{ direction: 'ltr' }}
                />
                <Mail className={`absolute top-3.5 w-4 h-4 ${isArabic ? 'left-3' : 'right-3'} text-gray-400`} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-natural-brand/80 font-bold">
                  {isArabic ? 'كلمة المرور' : 'Password'}
                </label>
                <button
                  type="button"
                  onClick={() => changeMode('forgot_password')}
                  className="text-[10px] text-natural-accent hover:underline hover:text-natural-brand cursor-pointer font-bold"
                >
                  {isArabic ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full border rounded-xl p-3 pl-10 pr-4 focus:outline-none focus:border-natural-brand transition ${
                    isDarkMode ? 'bg-natural-dark-bg border-neutral-750 text-slate-200' : 'bg-white border-natural-accent/40 text-natural-text'
                  }`}
                  style={{ direction: 'ltr' }}
                />
                <Lock className={`absolute top-3.5 w-4 h-4 ${isArabic ? 'left-3' : 'right-3'} text-gray-400`} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-natural-brand hover:bg-natural-brand/90 text-white font-bold p-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow active:scale-[0.98] transition"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <span>{isArabic ? 'تسجيل الدخول شفهياً' : 'Sign In Log'}</span>
              )}
            </button>

            {/* Social credentials split */}
            <div className="flex items-center gap-3 my-5 py-1">
              <div className="h-px bg-natural-accent/20 flex-1" />
              <span className="text-[10px] text-natural-accent/80 uppercase font-bold tracking-wider">{isArabic ? 'أو الدخول عبر' : 'Or enter via'}</span>
              <div className="h-px bg-natural-accent/20 flex-1" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleSocialGoogle}
                disabled={loading}
                className={`p-3 border rounded-xl flex items-center justify-center gap-2 font-bold cursor-pointer transition active:scale-95 ${
                  isDarkMode ? 'border-neutral-700 bg-neutral-800 hover:bg-neutral-750 text-slate-200' : 'border-gray-250 bg-gray-50 hover:bg-gray-100 text-[#1a1a1a]'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={handleSocialFacebook}
                disabled={loading}
                className={`p-3 border rounded-xl flex items-center justify-center gap-2 font-bold cursor-pointer transition active:scale-95 ${
                  isDarkMode ? 'border-neutral-700 bg-neutral-800 hover:bg-neutral-750 text-slate-200' : 'border-gray-250 bg-[#1877F2]/10 hover:bg-[#1877F2]/15 text-[#1877F2]'
                }`}
              >
                <Facebook className="w-3.5 h-3.5 shrink-0" />
                <span>Facebook</span>
              </button>
            </div>

            <p className="text-center text-[10.5px] text-gray-500 pt-3">
              {isArabic ? 'ليس لديك حساب؟ ' : 'Don\'t have an account? '}
              <button
                type="button"
                onClick={() => changeMode('register')}
                className="text-natural-accent hover:underline font-bold font-serif text-[11px] cursor-pointer"
              >
                {isArabic ? 'سجل حسابك مجاناً هنا' : 'Sign Up Free Here'}
              </button>
            </p>
          </form>
        )}

        {/* 2. REGISTER MODE */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4 text-xs font-sans">
            <div>
              <label className="block text-natural-brand/80 font-bold mb-1.5">
                {isArabic ? 'الاسم الكامل اللائق' : 'Full Professional Name'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  placeholder={isArabic ? 'عبد الرحمن المكي' : 'Abdul Rahman Al-Makki'}
                  className={`w-full border rounded-xl p-3 pl-10 pr-4 focus:outline-none focus:border-natural-brand transition ${
                    isDarkMode ? 'bg-natural-dark-bg border-neutral-750 text-slate-200' : 'bg-white border-natural-accent/40 text-natural-text'
                  }`}
                />
                <User className={`absolute top-3.5 w-4 h-4 ${isArabic ? 'left-3' : 'right-3'} text-gray-400`} />
              </div>
            </div>

            <div>
              <label className="block text-natural-brand/80 font-bold mb-1.5">
                {isArabic ? 'البريد الإلكتروني' : 'Your Email Address'}
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  placeholder="example@domain.com"
                  className={`w-full border rounded-xl p-3 pl-10 pr-4 focus:outline-none focus:border-natural-brand transition ${
                    isDarkMode ? 'bg-natural-dark-bg border-neutral-750 text-slate-200' : 'bg-white border-natural-accent/40 text-natural-text'
                  }`}
                  style={{ direction: 'ltr' }}
                />
                <Mail className={`absolute top-3.5 w-4 h-4 ${isArabic ? 'left-3' : 'right-3'} text-gray-400`} />
              </div>
            </div>

            <div>
              <label className="block text-natural-brand/80 font-bold mb-1.5">
                {isArabic ? 'رمز المرور الجديد' : 'Secure New Password'}
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full border rounded-xl p-3 pl-10 pr-4 focus:outline-none focus:border-natural-brand transition ${
                    isDarkMode ? 'bg-natural-dark-bg border-neutral-750 text-slate-200' : 'bg-white border-natural-accent/40 text-natural-text'
                  }`}
                  style={{ direction: 'ltr' }}
                />
                <Lock className={`absolute top-3.5 w-4 h-4 ${isArabic ? 'left-3' : 'right-3'} text-gray-400`} />
              </div>
            </div>

            <div>
              <label className="block text-natural-brand/80 font-bold mb-1.5">
                {isArabic ? 'تأكيد الرمز السري' : 'Confirm Your Password'}
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={registerConfirmPassword}
                  onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full border rounded-xl p-3 pl-10 pr-4 focus:outline-none focus:border-natural-brand transition ${
                    isDarkMode ? 'bg-natural-dark-bg border-neutral-750 text-slate-200' : 'bg-white border-natural-accent/40 text-natural-text'
                  }`}
                  style={{ direction: 'ltr' }}
                />
                <Lock className={`absolute top-3.5 w-4 h-4 ${isArabic ? 'left-3' : 'right-3'} text-gray-400`} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-natural-brand hover:bg-natural-brand/90 text-white font-bold p-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow transition active:scale-[0.98]"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <span>{isArabic ? 'سجل واحصل على التفعيل' : 'Sign Up & Verify'}</span>
              )}
            </button>

            <p className="text-center text-[10.5px] text-gray-500 pt-3">
              {isArabic ? 'لديك بالفعل حساب مسجل؟ ' : 'Already have an account? '}
              <button
                type="button"
                onClick={() => changeMode('login')}
                className="text-natural-accent hover:underline font-bold font-serif text-[11px] cursor-pointer"
              >
                {isArabic ? 'ادخل من هنا مباشرة' : 'Sign In Direct Here'}
              </button>
            </p>
          </form>
        )}

        {/* 3. FORGOT PASSWORD MODE */}
        {mode === 'forgot_password' && (
          <form onSubmit={handleResetPassword} className="space-y-4 text-xs font-sans">
            <div>
              <label className="block text-natural-brand/80 font-bold mb-1.5">
                {isArabic ? 'البريد الإلكتروني للبحث' : 'Register Email for Query'}
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="example@domain.com"
                  className={`w-full border rounded-xl p-3 pl-10 pr-4 focus:outline-none focus:border-natural-brand transition ${
                    isDarkMode ? 'bg-natural-dark-bg border-neutral-750 text-slate-200' : 'bg-white border-natural-accent/40 text-natural-text'
                  }`}
                  style={{ direction: 'ltr' }}
                />
                <Mail className={`absolute top-3.5 w-4 h-4 ${isArabic ? 'left-3' : 'right-3'} text-gray-400`} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-natural-brand hover:bg-natural-brand/90 text-white font-bold p-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow transition active:scale-[0.98]"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <span>{isArabic ? 'أرسل رابط الاسترداد' : 'Send Reset credentials'}</span>
              )}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => changeMode('login')}
                className="text-[10px] uppercase font-bold text-natural-accent hover:text-natural-brand flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                {isArabic ? (
                  <>
                    <span>العودة لصفحة الدخول</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span>Back to Login Screen</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* 4. EMAIL SENT / VERIFICATION STEPS */}
        {mode === 'email_sent' && (
          <div className="space-y-5 text-center text-xs font-sans">
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto animate-bounce mt-4">
              <Mail className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="font-serif text-lg font-bold text-natural-brand">
                {isArabic ? 'قم بتأكيد صندوق بريدك السري!' : 'Activate Your Password Account'}
              </h3>
              <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-350' : 'text-neutral-600'}`}>
                {isArabic
                  ? 'لقد أرسلنا رسالة تفويض وتحقق إلى عنوان بريدك الإلكتروني الشريف لإثبات هويتك. تفضل بفتح صندوق الوارد والضغط على الرابط المرفق لتفعيل الحساب.'
                  : 'We have dispatched a verification query directly to your registered email to secure custody. Open your mailbox and select the verification link.'}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => changeMode('login')}
                className="w-full bg-natural-brand hover:bg-natural-brand/90 text-white font-bold p-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow transition"
              >
                <span>{isArabic ? 'تم التأكيد! تسجيل الدخول' : 'Confirmed! Log In'}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
