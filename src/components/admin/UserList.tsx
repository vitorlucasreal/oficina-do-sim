import { useState, useMemo } from "react";
import {
  Search,
  Filter,
  ShieldAlert,
  UserCog,
  User,
  Shield,
  Key,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Phone,
  Eye,
  X,
  MapPin,
  FileText,
  Mail,
} from "lucide-react";

import { useAdminUsers } from "../../hooks/useAdminUsers";
import { useAuth } from "../../hooks/useAuth";
import { Profile, UserRole } from "../../types";
import { supabase } from "../../lib/supabase";

export default function UserList() {
  const {
    users,
    loading: usersLoading,
    error: usersError,
    refetch,
  } = useAdminUsers();

  const { profile: currentUser } = useAuth();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Usuário selecionado para visualizar os detalhes
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        (u.name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        (u.email?.toLowerCase().includes(search.toLowerCase()) ?? false);

      const matchesRole =
        roleFilter === "all" || u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  /**
   * ALTERAÇÃO DE ROLE
   *
   * Arquitetura:
   * - Apenas ADMIN pode gerenciar roles.
   * - Admin pode alterar Customer/Admin.
   * - Admin pode promover Customer/Admin para Owner.
   * - Owner não pode alterar roles.
   * - Ninguém pode alterar a própria role.
   * - Owner existente é intocável.
   */
  const handleRoleChange = async (
    targetUser: Profile,
    newRole: UserRole
  ) => {
    if (!currentUser) return;

    // Apenas Admin pode gerenciar roles
    if (currentUser.role !== "admin") {
      setMessage({
        type: "error",
        text: "Apenas administradores podem alterar níveis de acesso.",
      });
      return;
    }

    // Ninguém pode alterar a própria role
    if (targetUser.id === currentUser.id) {
      setMessage({
        type: "error",
        text: "Você não pode alterar seu próprio nível de acesso.",
      });
      return;
    }

    // Owner existente é intocável
    if (targetUser.role === "owner") {
      setMessage({
        type: "error",
        text: "Contas de Proprietários não podem ser alteradas.",
      });
      return;
    }

    setUpdatingId(targetUser.id);
    setMessage(null);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", targetUser.id);

      if (error) throw error;

      setMessage({
        type: "success",
        text: `Nível de acesso de ${
          targetUser.name || targetUser.email
        } atualizado para ${roleLabels[newRole]}.`,
      });

      await refetch();
    } catch (err: any) {
      console.error("Erro ao atualizar papel:", err);

      if (err.code === "42501") {
        setMessage({
          type: "error",
          text: "Você não tem permissão para alterar o nível de acesso. O banco de dados bloqueou esta operação.",
        });
      } else {
        setMessage({
          type: "error",
          text:
            err.message ||
            "Erro desconhecido ao alterar o nível de acesso.",
        });
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "owner":
        return <Key size={14} className="text-gold-default" />;

      case "admin":
        return <Shield size={14} className="text-blue-500" />;

      default:
        return <User size={14} className="text-charcoal/50" />;
    }
  };

  /**
   * Formata o endereço do cliente para exibição.
   */
  const getAddressLine = (user: Profile) => {
    const parts = [
      user.street,
      user.house_number,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(", ") : null;
  };

  if (usersLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-charcoal/50">
        <Loader2
          size={32}
          className="animate-spin mb-4 text-gold-default"
        />
        <p>Carregando usuários...</p>
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-red-500">
        <ShieldAlert size={32} className="mb-4" />

        <p>
          Erro ao carregar usuários. Verifique suas permissões.
        </p>

        <p className="text-sm mt-2 opacity-80">
          {usersError.message}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="font-serif text-3xl font-bold text-charcoal mb-2">
              Usuários
            </h2>

            <p className="text-charcoal/60">
              Gerencie os acessos e permissões da equipe.
            </p>
          </div>
        </div>

        {/* Mensagem */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl border flex items-start gap-3 ${
              message.type === "error"
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-green-50 border-green-200 text-green-700"
            }`}
          >
            {message.type === "error" ? (
              <AlertCircle
                size={20}
                className="shrink-0 mt-0.5"
              />
            ) : (
              <CheckCircle2
                size={20}
                className="shrink-0 mt-0.5"
              />
            )}

            <div>
              <strong className="block mb-1">
                {message.type === "error"
                  ? "Ação bloqueada"
                  : "Sucesso"}
              </strong>

              <p className="text-sm">
                {message.text}
              </p>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white p-4 rounded-2xl border border-pink-default/20 shadow-sm flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40"
            />

            <input
              type="text"
              placeholder="Buscar por nome ou e-mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-offwhite border border-pink-default/30 rounded-xl focus:outline-none focus:border-gold-default transition-colors text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter
              size={18}
              className="text-charcoal/40"
            />

            <select
              value={roleFilter}
              onChange={(e) =>
                setRoleFilter(e.target.value)
              }
              className="px-4 py-2.5 bg-offwhite border border-pink-default/30 rounded-xl focus:outline-none focus:border-gold-default transition-colors text-sm text-charcoal appearance-none min-w-[150px]"
            >
              <option value="all">
                Todos os Níveis
              </option>

              <option value="customer">
                Clientes
              </option>

              <option value="admin">
                Administradores
              </option>

              <option value="owner">
                Proprietários
              </option>
            </select>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-2xl border border-pink-default/20 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-offwhite text-charcoal/70 uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4 rounded-tl-2xl">
                    Usuário
                  </th>

                  <th className="px-6 py-4">
                    Nível de Acesso
                  </th>

                  <th className="px-6 py-4">
                    Data de Criação
                  </th>

                  <th className="px-6 py-4 text-right rounded-tr-2xl">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-pink-default/10">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-charcoal/50"
                    >
                      <UserCog
                        size={32}
                        className="mx-auto mb-3 opacity-50"
                      />

                      Nenhum usuário encontrado com os filtros atuais.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const isSelf =
                      currentUser?.id === user.id;

                    // Somente Admin pode alterar roles.
                    const canManageRoles =
                      currentUser?.role === "admin";

                    // Owner existente nunca pode ser alterado.
                    const isProtectedOwner =
                      user.role === "owner";

                    const roleSelectDisabled =
                      updatingId === user.id ||
                      isSelf ||
                      !canManageRoles ||
                      isProtectedOwner;

                    return (
                      <tr
                        key={user.id}
                        className="hover:bg-offwhite/50 transition-colors group"
                      >
                        {/* Usuário */}
                        <td className="px-6 py-4">
                          <div className="font-bold text-charcoal flex items-center gap-2">
                            {user.name || "Usuário sem nome"}

                            {isSelf && (
                              <span className="text-[10px] uppercase tracking-wider bg-gold-light/30 text-gold-dark px-2 py-0.5 rounded-full">
                                Você
                              </span>
                            )}
                          </div>

                          <div className="text-charcoal/60 text-xs mt-1">
                            {user.email}
                          </div>

                          {user.phone && (
                            <div className="text-charcoal/50 text-[10px] mt-0.5 flex items-center gap-1">
                              <Phone size={10} />
                              {user.phone}
                            </div>
                          )}

                          {user.phone_2 && (
                            <div className="text-charcoal/40 text-[10px] mt-0.5 flex items-center gap-1">
                              <Phone size={10} />
                              {user.phone_2} (Alt)
                            </div>
                          )}
                        </td>

                        {/* Role */}
                        <td className="px-6 py-4">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-pink-default/20 shadow-sm text-xs font-medium text-charcoal">
                            {getRoleIcon(user.role)}
                            {roleLabels[user.role]}
                          </div>
                        </td>

                        {/* Data */}
                        <td className="px-6 py-4 text-charcoal/60">
                          {new Date(
                            user.created_at
                          ).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>

                        {/* Ações */}
                        <td className="px-6 py-4">
                          <div className="flex justify-end items-center gap-2">
                            {/* Ver detalhes */}
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedUser(user)
                              }
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-pink-default/30 rounded-lg text-xs text-charcoal hover:border-gold-default hover:text-gold-dark transition-colors"
                              title="Ver dados completos"
                            >
                              <Eye size={14} />

                              <span className="hidden sm:inline">
                                Ver detalhes
                              </span>
                            </button>

                            {/* Alteração de role */}
                            <select
                              value={user.role}
                              onChange={(e) =>
                                handleRoleChange(
                                  user,
                                  e.target.value as UserRole
                                )
                              }
                              disabled={roleSelectDisabled}
                              className="px-3 py-1.5 bg-white border border-pink-default/30 rounded-lg text-xs focus:outline-none focus:border-gold-default transition-colors disabled:opacity-50 disabled:bg-gray-50 cursor-pointer"
                            >
                              {/* As três opções ficam sempre presentes.
                                  Isso evita que o browser mostre
                                  "Cliente" quando o usuário atual é Owner. */}
                              <option value="customer">
                                Cliente
                              </option>

                              <option value="admin">
                                Administrador
                              </option>

                              <option value="owner">
                                Proprietário
                              </option>
                            </select>

                            {updatingId === user.id && (
                              <div className="p-1.5 text-gold-default">
                                <Loader2
                                  size={16}
                                  className="animate-spin"
                                />
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ============================================================
          MODAL DE DETALHES DO CLIENTE
          ============================================================ */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="bg-white w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 modal-scrollbar my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho do modal */}
            <div className="sticky top-0 bg-white z-10 px-4 sm:px-6 py-4 sm:py-5 border-b border-pink-default/10 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  {getRoleIcon(selectedUser.role)}

                  <span className="text-xs uppercase tracking-wider text-charcoal/50 font-semibold">
                    {roleLabels[selectedUser.role]}
                  </span>
                </div>

                <h3 className="font-serif text-xl sm:text-2xl font-bold text-charcoal mt-1">
                  {selectedUser.name || "Usuário sem nome"}
                </h3>

                <p className="text-xs sm:text-sm text-charcoal/50 mt-1">
                  Dados cadastrais
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="p-2 rounded-full hover:bg-offwhite text-charcoal/50 hover:text-charcoal transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
                title="Fechar"
                aria-label="Fechar detalhes do usuário"
              >
                <X size={20} />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Contato */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Mail
                    size={17}
                    className="text-gold-default"
                  />

                  <h4 className="font-semibold text-charcoal">
                    Contato
                  </h4>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <DetailItem
                    label="E-mail"
                    value={selectedUser.email}
                  />

                  <DetailItem
                    label="WhatsApp / Telefone"
                    value={selectedUser.phone}
                  />

                  <DetailItem
                    label="Telefone 2"
                    value={selectedUser.phone_2}
                  />
                </div>
              </section>

              {/* Documento */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <FileText
                    size={17}
                    className="text-gold-default"
                  />

                  <h4 className="font-semibold text-charcoal">
                    Documento
                  </h4>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <DetailItem
                    label="CPF"
                    value={selectedUser.cpf}
                  />
                </div>
              </section>

              {/* Endereço */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <MapPin
                    size={17}
                    className="text-gold-default"
                  />

                  <h4 className="font-semibold text-charcoal">
                    Endereço
                  </h4>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <DetailItem
                    label="CEP"
                    value={selectedUser.cep}
                  />

                  <DetailItem
                    label="Estado"
                    value={selectedUser.state}
                  />

                  <DetailItem
                    label="Cidade"
                    value={selectedUser.city}
                  />

                  <DetailItem
                    label="Bairro"
                    value={selectedUser.neighborhood}
                  />

                  <DetailItem
                    label="Rua"
                    value={selectedUser.street}
                  />

                  <DetailItem
                    label="Número"
                    value={selectedUser.house_number}
                  />

                  <DetailItem
                    label="Complemento"
                    value={selectedUser.complement}
                  />

                  <DetailItem
                    label="Referência"
                    value={selectedUser.reference}
                  />
                </div>

                {/* Endereço resumido */}
                {getAddressLine(selectedUser) && (
                  <div className="mt-4 p-3 bg-offwhite rounded-xl border border-pink-default/10">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-charcoal/40 mb-1">
                      Endereço
                    </p>

                    <p className="text-sm text-charcoal">
                      {getAddressLine(selectedUser)}

                      {selectedUser.neighborhood
                        ? ` - ${selectedUser.neighborhood}`
                        : ""}

                      {selectedUser.city
                        ? `, ${selectedUser.city}`
                        : ""}

                      {selectedUser.state
                        ? ` - ${selectedUser.state}`
                        : ""}
                    </p>
                  </div>
                )}
              </section>

              {/* Rodapé informativo */}
              <div className="pt-4 border-t border-pink-default/10">
                <p className="text-xs text-charcoal/40">
                  Os dados acima são provenientes do cadastro do
                  cliente e estão armazenados no perfil da conta.
                </p>
              </div>
            </div>

            {/* Rodapé */}
            <div className="px-6 py-4 border-t border-pink-default/10 flex justify-end bg-offwhite/30">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2.5 bg-charcoal text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Campo usado dentro do modal de detalhes.
 */
function DetailItem({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider font-bold text-charcoal/40 mb-1">
        {label}
      </p>

      <p
        className={`text-sm ${
          value
            ? "text-charcoal"
            : "text-charcoal/30 italic"
        }`}
      >
        {value || "Não informado"}
      </p>
    </div>
  );
}

const roleLabels: Record<UserRole, string> = {
  customer: "Cliente",
  admin: "Administrador",
  owner: "Proprietário",
};