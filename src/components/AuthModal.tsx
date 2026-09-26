import React, { useState } from "react";
import { X, Mail, Lock, User as UserIcon, Loader2, Phone, Eye, EyeOff, CheckCircle } from "lucide-react";
import { supabase } from "../lib/supabase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultView?: "login" | "signup" | "recovery" | "update_password";
}

function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export default function AuthModal({
  isOpen,
  onClose,
  defaultView = "login",
}: AuthModalProps) {
  const [view, setView] = useState<
    "login" | "signup" | "recovery" | "update_password"
  >(defaultView);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  
  // Address fields
  const [cep, setCep] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [street, setStreet] = useState("");
  const [house_number, setHouseNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [reference, setReference] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 8) val = val.slice(0, 8);
    if (val.length > 5) val = `${val.slice(0, 5)}-${val.slice(5)}`;
    setCep(val);
  };
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 11) val = val.slice(0, 11);
    if (val.length > 2) val = `(${val.slice(0, 2)}) ${val.slice(2)}`;
    if (val.length > 10) val = `${val.slice(0, 10)}-${val.slice(10)}`;
    setPhone(val);
  };

  React.useEffect(() => {
    if (isOpen) {
      setView(defaultView);
      setError(null);
      setSuccess(null);
      setLoading(false);
      setGoogleLoading(false);
    }
  }, [defaultView, isOpen]);

  if (!isOpen) return null;

  const resetState = () => {
    setError(null);
    setSuccess(null);
    setLoading(false);
    setGoogleLoading(false);
  };

  const switchView = (
    newView: "login" | "signup" | "recovery"
  ) => {
    setView(newView);
    resetState();
  };

  const handleGoogleLogin = async () => {
    if (loading || googleLoading) return;

    setError(null);
    setSuccess(null);
    setGoogleLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        console.error("Google login error:", error);
        setError("Não foi possível conectar com o Google. Tente novamente.");
        setGoogleLoading(false);
      }
    } catch (err) {
      console.error("Unexpected Google login error:", err);
      setError("Não foi possível conectar com o Google. Tente novamente.");
      setGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        setError("Credenciais inválidas. Tente novamente.");
        return;
      }

      onClose();
    } catch (err) {
      console.error("Unexpected login error:", err);
      setError("Não foi possível entrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setSuccess(null);
    setLoading(true);

    if (password !== confirmPassword) {
      setError("As senhas digitadas não são iguais. Verifique e tente novamente.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            phone: phone,
            cep,
            state,
            city,
            neighborhood,
            street,
            house_number,
            complement,
            reference,
          },
        },
      });

      if (error) {
        console.error("Signup error:", error);
        setError(error.message);
        return;
      }

      setSuccess(
        "Conta criada com sucesso! Verifique seu e-mail ou faça login."
      );


    } catch (err) {
      console.error("Unexpected signup error:", err);
      setError("Não foi possível criar a conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/?type=recovery`,
      });

      if (error) {
        console.error("Recovery error:", error);
        setError(error.message);
        return;
      }

      setSuccess(
        "E-mail de recuperação enviado! Verifique sua caixa de entrada."
      );
    } catch (err) {
      console.error("Unexpected recovery error:", err);
      setError(
        "Não foi possível enviar o e-mail de recuperação. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Recovery session error:", sessionError);
        setError(
          "Não foi possível validar a sessão de recuperação. Solicite um novo link."
        );
        return;
      }

      if (!session) {
        setError(
          "Sessão de recuperação inválida ou expirada. Por favor, solicite um novo link."
        );
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        console.error("Update password error:", error);
        setError("Erro ao atualizar a senha. Tente novamente.");
        return;
      }

      setSuccess("Senha atualizada com sucesso!");

      setTimeout(() => {
        onClose();

        // Limpa os tokens do hash da URL após a recuperação.
        if (window.location.hash) {
          window.history.replaceState(
            {},
            document.title,
            `${window.location.pathname}${window.location.search}`
          );
        }
      }, 2000);
    } catch (err) {
      console.error("Unexpected update password error:", err);
      setError("Não foi possível atualizar a senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-charcoal/40 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[92vh] overflow-y-auto relative animate-in zoom-in-95 duration-200 my-auto modal-scrollbar">
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 text-charcoal/50 hover:text-charcoal hover:bg-pink-light rounded-full transition-colors focus:outline-none min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer z-10"
        >
          <X size={20} />
        </button>

        <div className="p-5 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-serif font-bold text-charcoal tracking-wide mb-2">
              {view === "login" && "Bem-vinda de volta"}
              {view === "signup" && "Criar Conta"}
              {view === "recovery" && "Recuperar Senha"}
              {view === "update_password" && "Nova Senha"}
            </h2>

            <p className="text-sm text-charcoal/60">
              {view === "login" && "Acesse sua conta para continuar"}
              {view === "signup" && "Junte-se à Oficina do Sim"}
              {view === "recovery" &&
                "Enviaremos um link para seu e-mail"}
              {view === "update_password" &&
                "Digite sua nova senha abaixo"}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
              {error}
            </div>
          )}

          {success && view === "signup" ? (
            <div className="flex flex-col items-center text-center space-y-4 py-6">
              <CheckCircle size={48} className="text-sage-default mb-2" />
              <h3 className="text-lg font-bold text-charcoal">Cadastro realizado com sucesso!</h3>
              <p className="text-sm text-charcoal/70">{success}</p>
              <button
                onClick={() => switchView("login")}
                className="w-full mt-4 py-2.5 bg-gold-dark text-white rounded-lg text-sm font-semibold tracking-wider hover:bg-gold-default transition-colors"
              >
                Continuar para o Login
              </button>
            </div>
          ) : (
            <>
            {success && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100 text-center">
                {success}
              </div>
            )}

            {(view === "login" || view === "signup") && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading || googleLoading}
                  aria-label="Continuar com Google"
                  className="w-full py-2.5 px-4 bg-white border border-pink-default/40 hover:border-gold-default/60 hover:bg-pink-light/20 text-charcoal rounded-lg text-sm font-medium transition-all shadow-sm flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold-default/30"
                >
                  {googleLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin text-charcoal/60 flex-shrink-0" />
                      <span className="text-charcoal/80">Conectando ao Google...</span>
                    </>
                  ) : (
                    <>
                      <GoogleIcon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-charcoal/90">Continuar com Google</span>
                    </>
                  )}
                </button>

                <div className="relative flex items-center my-4">
                  <div className="flex-grow border-t border-pink-default/30"></div>
                  <span className="flex-shrink mx-3 text-xs uppercase tracking-wider text-charcoal/50 font-medium">
                    ou
                  </span>
                  <div className="flex-grow border-t border-pink-default/30"></div>
                </div>
              </div>
            )}

            <form
            onSubmit={
              view === "login"
                ? handleLogin
                : view === "signup"
                ? handleSignup
                : view === "recovery"
                ? handleRecovery
                : handleUpdatePassword
            }
            className="space-y-4"
          >
            {view === "signup" && (
              <>
                <div className="grid grid-cols-1 gap-4">
                  <div className="relative">
                    <UserIcon
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40"
                    />
                    <input
                      type="text"
                      placeholder="Nome completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2 bg-offwhite border border-pink-default/30 rounded-lg text-sm focus:outline-none focus:border-gold-default transition-colors"
                    />
                  </div>
                  
                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40"
                    />
                    <input
                      type="text"
                      placeholder="WhatsApp/Telefone"
                      value={phone}
                      onChange={handlePhoneChange}
                      required
                      className="w-full pl-10 pr-4 py-2 bg-offwhite border border-pink-default/30 rounded-lg text-sm focus:outline-none focus:border-gold-default transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-pink-default/20">
                  <span className="text-xs font-semibold text-charcoal/80 uppercase tracking-widest block mb-3">Endereço de Entrega</span>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="CEP"
                      value={cep}
                      onChange={handleCepChange}
                      required
                      className="w-full px-3 py-2 bg-offwhite border border-pink-default/30 rounded-lg text-sm focus:outline-none focus:border-gold-default transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Estado (UF)"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      required
                      maxLength={2}
                      className="w-full px-3 py-2 bg-offwhite border border-pink-default/30 rounded-lg text-sm focus:outline-none focus:border-gold-default transition-colors uppercase"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-3 mt-3">
                    <input
                      type="text"
                      placeholder="Cidade"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-offwhite border border-pink-default/30 rounded-lg text-sm focus:outline-none focus:border-gold-default transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Bairro"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-offwhite border border-pink-default/30 rounded-lg text-sm focus:outline-none focus:border-gold-default transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <input
                      type="text"
                      placeholder="Rua"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-offwhite border border-pink-default/30 rounded-lg text-sm focus:outline-none focus:border-gold-default transition-colors col-span-2"
                    />
                    <input
                      type="text"
                      placeholder="Nº"
                      value={house_number}
                      onChange={(e) => setHouseNumber(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-offwhite border border-pink-default/30 rounded-lg text-sm focus:outline-none focus:border-gold-default transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3 mb-2">
                    <input
                      type="text"
                      placeholder="Complemento"
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                      className="w-full px-3 py-2 bg-offwhite border border-pink-default/30 rounded-lg text-sm focus:outline-none focus:border-gold-default transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Referência"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      className="w-full px-3 py-2 bg-offwhite border border-pink-default/30 rounded-lg text-sm focus:outline-none focus:border-gold-default transition-colors"
                    />
                  </div>
                </div>
              </>
            )}

            {view !== "update_password" && (
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40"
                />
                <input
                  type="email"
                  placeholder="Seu melhor e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2 bg-offwhite border border-pink-default/30 rounded-lg text-sm focus:outline-none focus:border-gold-default transition-colors"
                />
              </div>
            )}

            {(view === "login" ||
              view === "signup" ||
              view === "update_password") && (
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={
                    view === "update_password"
                      ? "Nova senha"
                      : "Senha"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-10 py-2 bg-offwhite border border-pink-default/30 rounded-lg text-sm focus:outline-none focus:border-gold-default transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal/70 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            )}
            
            {view === "signup" && (
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40"
                />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirmar senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-10 py-2 bg-offwhite border border-pink-default/30 rounded-lg text-sm focus:outline-none focus:border-gold-default transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal/70 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            )}

            {view === "login" && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => switchView("recovery")}
                  className="text-xs text-charcoal/60 hover:text-gold-dark transition-colors focus:outline-none"
                >
                  Esqueci minha senha
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-2 bg-gold-dark text-white rounded-lg text-sm font-semibold tracking-wider hover:bg-gold-default transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading && (
                <Loader2 size={16} className="animate-spin" />
              )}

              {view === "login" && "Entrar"}
              {view === "signup" && "Criar Conta"}
              {view === "recovery" && "Enviar link"}
              {view === "update_password" && "Salvar nova senha"}
            </button>
          </form>

          {view !== "update_password" && (
            <div className="mt-6 text-center text-sm text-charcoal/60">
              {view === "login" ? (
                <p>
                  Ainda não tem conta?{" "}
                  <button
                    onClick={() => switchView("signup")}
                    className="text-gold-dark font-medium hover:underline focus:outline-none"
                  >
                    Cadastre-se
                  </button>
                </p>
              ) : (
                <p>
                  Já tem uma conta?{" "}
                  <button
                    onClick={() => switchView("login")}
                    className="text-gold-dark font-medium hover:underline focus:outline-none"
                  >
                    Fazer login
                  </button>
                </p>
              )}
            </div>
          )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}