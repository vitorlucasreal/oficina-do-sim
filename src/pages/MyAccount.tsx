import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { Profile } from "../types";
import { User, MapPin, Save, Loader2, LogOut, ArrowLeft } from "lucide-react";

interface MyAccountProps {
  onBack: () => void;
}

export default function MyAccount({ onBack }: MyAccountProps) {
  const { profile, session, signOut } = useAuth();
  
  const [formData, setFormData] = useState<Partial<Profile>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-charcoal">
        <Loader2 size={32} className="animate-spin text-gold-default mb-4" />
        <p>Avaliando autenticação...</p>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let val = value.replace(/\D/g, "");
    if (val.length > 11) val = val.slice(0, 11);
    if (val.length > 2) val = `(${val.slice(0, 2)}) ${val.slice(2)}`;
    if (val.length > 10) val = `${val.slice(0, 10)}-${val.slice(10)}`;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 11) val = val.slice(0, 11);
    if (val.length > 3) val = `${val.slice(0, 3)}.${val.slice(3)}`;
    if (val.length > 7) val = `${val.slice(0, 7)}.${val.slice(7)}`;
    if (val.length > 11) val = `${val.slice(0, 11)}-${val.slice(11)}`;
    setFormData(prev => ({ ...prev, cpf: val }));
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 8) val = val.slice(0, 8);
    if (val.length > 5) val = `${val.slice(0, 5)}-${val.slice(5)}`;
    setFormData(prev => ({ ...prev, cep: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsSaving(true);
    setMessage(null);

    // Filter out fields that shouldn't be updated directly by the user just in case
    const { id, role, created_at, updated_at, email, ...updateData } = formData as any;

    try {
      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", profile.id);

      if (error) throw error;
      
      setMessage({ type: 'success', text: 'Seus dados foram atualizados com sucesso.' });
      
      // Auto-hide success message
      setTimeout(() => setMessage(null), 3000);
      
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setMessage({ type: 'error', text: err.message || 'Não foi possível salvar os dados.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-charcoal/60 hover:text-charcoal transition-colors mb-6 font-medium text-sm"
      >
        <ArrowLeft size={16} /> Voltar
      </button>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-charcoal mb-2">Minha Conta</h1>
          <p className="text-charcoal/60">Gerencie suas informações pessoais e endereços de entrega.</p>
        </div>
        
        <button
          onClick={async () => {
            await signOut();
            onBack();
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors text-sm font-semibold whitespace-nowrap"
        >
          <LogOut size={16} /> Sair da conta
        </button>
      </div>

      {message && (
        <div className={`mb-8 p-4 rounded-xl border flex items-start gap-3 ${
          message.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'
        }`}>
          <div>
            <strong className="block mb-1">{message.type === 'error' ? 'Erro ao salvar' : 'Sucesso'}</strong>
            <p className="text-sm">{message.text}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* DADOS PESSOAIS */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-pink-default/20 p-4 sm:p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-pink-default/20">
            <div className="w-10 h-10 rounded-full bg-pink-light flex items-center justify-center text-gold-dark shrink-0">
              <User size={20} />
            </div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-charcoal">Dados Pessoais</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block text-sm font-bold text-charcoal">E-mail (Login)</label>
              <input
                type="text"
                value={profile?.email || ""}
                disabled
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-charcoal/50 text-sm cursor-not-allowed"
              />
              <p className="text-[10px] text-charcoal/40 mt-1">O e-mail da conta não pode ser alterado por aqui.</p>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-bold text-charcoal">Nome Completo</label>
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-offwhite border border-pink-default/30 rounded-xl focus:outline-none focus:border-gold-default transition-colors text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-bold text-charcoal">CPF (Opcional)</label>
              <input
                type="text"
                name="cpf"
                value={formData.cpf || ""}
                onChange={handleCpfChange}
                placeholder="000.000.000-00"
                className="w-full px-4 py-2.5 bg-offwhite border border-pink-default/30 rounded-xl focus:outline-none focus:border-gold-default transition-colors text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-bold text-charcoal">Celular / WhatsApp</label>
              <input
                type="text"
                name="phone"
                value={formData.phone || ""}
                onChange={handlePhoneChange}
                placeholder="(00) 00000-0000"
                className="w-full px-4 py-2.5 bg-offwhite border border-pink-default/30 rounded-xl focus:outline-none focus:border-gold-default transition-colors text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-bold text-charcoal">Telefone Secundário (Opcional)</label>
              <input
                type="text"
                name="phone_2"
                value={formData.phone_2 || ""}
                onChange={handlePhoneChange}
                placeholder="(00) 00000-0000"
                className="w-full px-4 py-2.5 bg-offwhite border border-pink-default/30 rounded-xl focus:outline-none focus:border-gold-default transition-colors text-sm"
              />
            </div>
          </div>
        </div>

        {/* ENDEREÇO */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-pink-default/20 p-4 sm:p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-pink-default/20">
            <div className="w-10 h-10 rounded-full bg-pink-light flex items-center justify-center text-gold-dark shrink-0">
              <MapPin size={20} />
            </div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-charcoal">Endereço Principal</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
            <div className="space-y-1 md:col-span-2">
              <label className="block text-sm font-bold text-charcoal">CEP</label>
              <input
                type="text"
                name="cep"
                value={formData.cep || ""}
                onChange={handleCepChange}
                placeholder="00000-000"
                required
                className="w-full px-4 py-2.5 bg-offwhite border border-pink-default/30 rounded-xl focus:outline-none focus:border-gold-default transition-colors text-sm"
              />
            </div>

            <div className="space-y-1 md:col-span-3">
              <label className="block text-sm font-bold text-charcoal">Rua/Logradouro</label>
              <input
                type="text"
                name="street"
                value={formData.street || ""}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-offwhite border border-pink-default/30 rounded-xl focus:outline-none focus:border-gold-default transition-colors text-sm"
              />
            </div>

            <div className="space-y-1 md:col-span-1">
              <label className="block text-sm font-bold text-charcoal">Número</label>
              <input
                type="text"
                name="house_number"
                value={formData.house_number || ""}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-offwhite border border-pink-default/30 rounded-xl focus:outline-none focus:border-gold-default transition-colors text-sm"
              />
            </div>

            <div className="space-y-1 md:col-span-3">
              <label className="block text-sm font-bold text-charcoal">Complemento</label>
              <input
                type="text"
                name="complement"
                value={formData.complement || ""}
                onChange={handleChange}
                placeholder="Apto, Bloco, etc."
                className="w-full px-4 py-2.5 bg-offwhite border border-pink-default/30 rounded-xl focus:outline-none focus:border-gold-default transition-colors text-sm"
              />
            </div>

            <div className="space-y-1 md:col-span-3">
              <label className="block text-sm font-bold text-charcoal">Bairro</label>
              <input
                type="text"
                name="neighborhood"
                value={formData.neighborhood || ""}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-offwhite border border-pink-default/30 rounded-xl focus:outline-none focus:border-gold-default transition-colors text-sm"
              />
            </div>

            <div className="space-y-1 md:col-span-4">
              <label className="block text-sm font-bold text-charcoal">Cidade</label>
              <input
                type="text"
                name="city"
                value={formData.city || ""}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-offwhite border border-pink-default/30 rounded-xl focus:outline-none focus:border-gold-default transition-colors text-sm"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="block text-sm font-bold text-charcoal">Estado (UF)</label>
              <input
                type="text"
                name="state"
                value={formData.state || ""}
                onChange={handleChange}
                placeholder="SP, RJ, MG..."
                maxLength={2}
                required
                className="w-full px-4 py-2.5 bg-offwhite border border-pink-default/30 rounded-xl focus:outline-none focus:border-gold-default transition-colors text-sm uppercase"
              />
            </div>

            <div className="space-y-1 md:col-span-6">
              <label className="block text-sm font-bold text-charcoal">Ponto de Referência</label>
              <input
                type="text"
                name="reference"
                value={formData.reference || ""}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-offwhite border border-pink-default/30 rounded-xl focus:outline-none focus:border-gold-default transition-colors text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-8 py-3.5 bg-gold-dark text-white rounded-xl font-bold hover:bg-gold-default transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            {isSaving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
