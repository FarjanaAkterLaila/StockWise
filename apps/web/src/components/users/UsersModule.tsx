import React, { useState, useEffect, useMemo } from "react";
import type { UserAccount, UserRole } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  fetchUsers,
  createUserAccount,
  updateUserAccount,
} from "@/services/users.service";
import {
  canManageTargetUser,
  formatRoleLabel,
  getAssignableRoles,
  hasPermission,
  normalizeRole,
} from "@/utils/permissions";
import { formatDate } from "@/utils/formatters";
import { DataTable, type TableColumn } from "@/components/common/DataTable";
import { Badge } from "@/components/common/Badge";
import { GenericLoader } from "@/components/common/GenericLoader";
import { ModalForm } from "@/components/common/ModalForm";
import { CustomSelect } from "@/components/common/CustomSelect";
import { Users, Plus, Pencil, Shield } from "lucide-react";
import {
  SalesContainer,
  TopActionHeader,
  TitleWrap,
  PageTitle,
  PageSubtitle,
  HeaderActions,
  CreateSaleBtn,
  TableRow,
  TableCell,
  CustomerCell,
  CustomerNameText,
  CustomerMeta,
  DateText,
  ActionButtonsGroup,
  ActionBtn,
  FormRow,
  FormGroup,
  FormLabel,
  FormInput,
  FormError,
} from "@/components/sales/Sales.styles";

const USER_COLUMNS: TableColumn[] = [
  { label: "User" },
  { label: "Role" },
  { label: "Phone" },
  { label: "Joined" },
  { label: "Actions", align: "right" },
];

const ROLE_BADGE_VARIANT: Record<UserRole, "danger" | "primary" | "neutral"> = {
  admin: "danger",
  manager: "primary",
  staff: "neutral",
};

interface UserFormState {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
}

export const UsersModule: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const { showSuccess, showError } = useToast();
  const actorRole = normalizeRole(user?.role);

  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formState, setFormState] = useState<UserFormState>({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    role: "staff",
  });

  const canCreateUsers = hasPermission(actorRole, "users", "create");
  const assignableRoles = useMemo(
    () => getAssignableRoles(actorRole),
    [actorRole],
  );

  const loadUsers = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (err: unknown) {
      setLoadError((err as Error).message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchUsers()
      .then((data) => {
        if (isMounted) {
          setUsers(data);
          setLoadError(null);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setLoadError((err as Error).message || "Failed to load users.");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setErrors({});
    setFormState({
      fullName: "",
      email: "",
      password: "",
      phone: "",
      role: "staff",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (target: UserAccount) => {
    if (!canManageTargetUser(actorRole, target.role)) {
      showError(
        "Access Denied",
        "You do not have permission to manage this user account.",
      );
      return;
    }
    setEditingUser(target);
    setErrors({});
    setFormState({
      fullName: target.fullName,
      email: target.email,
      password: "",
      phone: target.phone,
      role: target.role,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!formState.fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }
    if (!editingUser) {
      if (!formState.email.trim()) {
        nextErrors.email = "Email address is required.";
      }
      if (!formState.password || formState.password.length < 6) {
        nextErrors.password = "Password must be at least 6 characters.";
      }
    }
    if (!assignableRoles.includes(formState.role)) {
      nextErrors.role = "You are not permitted to assign this role.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingUser) {
        const updated = await updateUserAccount(
          editingUser,
          {
            fullName: formState.fullName,
            phone: formState.phone,
            role: formState.role,
          },
          actorRole,
          users,
        );
        setUsers((prev) =>
          prev.map((u) => (u.id === updated.id ? updated : u)),
        );
        if (updated.id === user?.id) {
          await refreshProfile();
        }
        setIsModalOpen(false);
        setEditingUser(null);
        showSuccess("User Updated", `${updated.fullName} updated successfully.`);
      } else {
        const created = await createUserAccount(
          {
            fullName: formState.fullName,
            email: formState.email,
            password: formState.password,
            phone: formState.phone,
            role: formState.role,
          },
          actorRole,
        );
        setUsers((prev) => [
          created,
          ...prev.filter((u) => u.id !== created.id),
        ]);
        setIsModalOpen(false);
        showSuccess("User Created", `${created.fullName} added as ${formatRoleLabel(created.role)}.`);
      }
    } catch (err: unknown) {
      showError(
        editingUser ? "Update Failed" : "Create Failed",
        (err as Error).message || "Unable to save user account.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SalesContainer>
      <TopActionHeader>
        <TitleWrap>
          <PageTitle>User Management</PageTitle>
          <PageSubtitle>
            {actorRole === "admin"
              ? "Manage operator accounts and assign Admin, Manager, or Staff roles"
              : "Manage Staff operator accounts"}
          </PageSubtitle>
        </TitleWrap>
        {canCreateUsers && (
          <HeaderActions>
            <CreateSaleBtn type="button" onClick={openCreateModal}>
              <Plus size={16} />
              <span>{actorRole === "admin" ? "Add User" : "Add Staff"}</span>
            </CreateSaleBtn>
          </HeaderActions>
        )}
      </TopActionHeader>

      {loading ? (
        <GenericLoader
          message="Loading users..."
          subtext="Fetching operator profiles and assigned roles"
        />
      ) : loadError ? (
        <div
          role="alert"
          style={{
            padding: 20,
            borderRadius: 12,
            border: "1px solid #ef4444",
          }}
        >
          <p>Unable to load users: {loadError}</p>
          <button type="button" onClick={() => void loadUsers()}>
            Retry
          </button>
        </div>
      ) : (
        <DataTable
          columns={USER_COLUMNS}
          itemCount={users.length}
          totalAllCount={users.length}
          itemLabel="users"
          emptyIcon={<Users size={28} />}
          emptyTitle="No Users Found"
          emptyDesc="No user profiles are currently available."
        >
          {users.map((account) => {
            const canManage = canManageTargetUser(actorRole, account.role);
            const roleLabel = formatRoleLabel(account.role);

            return (
              <TableRow key={account.id}>
                <TableCell>
                  <CustomerCell>
                    <CustomerNameText>{account.fullName}</CustomerNameText>
                    <CustomerMeta>{account.email || "—"}</CustomerMeta>
                  </CustomerCell>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={ROLE_BADGE_VARIANT[account.role]}
                    size="sm"
                    dot
                  >
                    {roleLabel}
                  </Badge>
                </TableCell>

                <TableCell>
                  <DateText>{account.phone || "—"}</DateText>
                </TableCell>

                <TableCell>
                  <DateText>{formatDate(account.createdAt)}</DateText>
                </TableCell>

                <TableCell $align="right">
                  <ActionButtonsGroup>
                    {canManage ? (
                      <ActionBtn
                        $variant="edit"
                        type="button"
                        onClick={() => openEditModal(account)}
                        title={`Edit ${account.fullName}`}
                      >
                        <Pencil size={15} />
                      </ActionBtn>
                    ) : (
                      <span
                        title="Restricted"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 12,
                          color: "#94a3b8",
                        }}
                      >
                        <Shield size={13} />
                        Restricted
                      </span>
                    )}
                  </ActionButtonsGroup>
                </TableCell>
              </TableRow>
            );
          })}
        </DataTable>
      )}

      {isModalOpen && (
        <ModalForm
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingUser(null);
          }}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          size="md"
          title={editingUser ? `Edit User: ${editingUser.fullName}` : "Create User Account"}
          subtitle={
            actorRole === "admin"
              ? "Configure account details and role assignment"
              : "Managers can create and manage Staff accounts only"
          }
          submitText={editingUser ? "Save Changes" : "Create User"}
        >
          <FormRow $cols="1fr 1fr">
            <FormGroup>
              <FormLabel>
                Full Name <span className="required">*</span>
              </FormLabel>
              <FormInput
                type="text"
                value={formState.fullName}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, fullName: e.target.value }))
                }
                placeholder="e.g. Tanvir Hasan"
              />
              {errors.fullName && <FormError>{errors.fullName}</FormError>}
            </FormGroup>

            <FormGroup>
              <FormLabel>Phone</FormLabel>
              <FormInput
                type="text"
                value={formState.phone}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="e.g. 01712345678"
              />
            </FormGroup>
          </FormRow>

          {!editingUser && (
            <FormRow $cols="1fr 1fr">
              <FormGroup>
                <FormLabel>
                  Email Address <span className="required">*</span>
                </FormLabel>
                <FormInput
                  type="email"
                  value={formState.email}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="user@stockwise.com"
                />
                {errors.email && <FormError>{errors.email}</FormError>}
              </FormGroup>

              <FormGroup>
                <FormLabel>
                  Temporary Password <span className="required">*</span>
                </FormLabel>
                <FormInput
                  type="password"
                  value={formState.password}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, password: e.target.value }))
                  }
                  placeholder="Minimum 6 characters"
                />
                {errors.password && <FormError>{errors.password}</FormError>}
              </FormGroup>
            </FormRow>
          )}

          <FormGroup>
            <FormLabel>
              Role <span className="required">*</span>
            </FormLabel>
            {actorRole === "admin" ? (
              <CustomSelect
                fullWidth
                value={formState.role}
                onChange={(val) =>
                  setFormState((prev) => ({
                    ...prev,
                    role: normalizeRole(val),
                  }))
                }
                options={assignableRoles.map((r) => ({
                  value: r,
                  label: formatRoleLabel(r),
                }))}
              />
            ) : (
              <FormInput type="text" value="Staff" readOnly />
            )}
            {errors.role && <FormError>{errors.role}</FormError>}
          </FormGroup>
        </ModalForm>
      )}
    </SalesContainer>
  );
};
