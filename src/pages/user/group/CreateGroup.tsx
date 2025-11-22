import { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  MenuItem,
  Slider,
  Snackbar,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  Card,
  CardContent,
} from '@mui/material'
import { Add, Delete, Description } from '@mui/icons-material'
import { groupApi } from '@/services/group/groups'
import { userApi } from '@/services/user/api'
import { useAppSelector } from '@/store/hooks'
import { useGroups } from '@/hooks/useGroups'
import type { UUID } from '@/models/booking'

const steps = [
  "Thông tin nhóm",
  "Tỷ lệ sở hữu",
  "Chọn hợp đồng điện tử",
];

// Hardcoded e-contract templates (matching backend templates)
const E_CONTRACT_TEMPLATES = [
  {
    id: "co-ownership-agreement",
    name: "Hợp đồng đồng sở hữu xe",
    description: "Hợp đồng chính thức về quyền sở hữu và trách nhiệm giữa các thành viên",
    category: "Legal",
    recommended: true,
  },
  {
    id: "cost-sharing-agreement",
    name: "Thỏa thuận chia sẻ chi phí",
    description: "Thỏa thuận về cách chia sẻ các chi phí liên quan đến xe",
    category: "Financial",
    recommended: false,
  },
  {
    id: "usage-terms",
    name: "Điều khoản sử dụng",
    description: "Quy định về cách sử dụng xe và các quy tắc đặt chỗ",
    category: "Usage",
    recommended: false,
  },
  {
    id: "maintenance-contract",
    name: "Hợp đồng bảo trì",
    description: "Thỏa thuận về trách nhiệm bảo trì và bảo dưỡng xe",
    category: "Maintenance",
    recommended: false,
  },
];

type MemberDraft = {
  email: string;
  userId: string | null;
  userName: string;
  share: number;
  role: "Admin" | "Member";
};

const CreateGroup = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { reload: reloadGroups } = useGroups();
  const [activeStep, setActiveStep] = useState(0);
  const [groupInfo, setGroupInfo] = useState({ name: "", description: "" });
  const [members, setMembers] = useState<MemberDraft[]>([
    { email: "", userId: null, userName: "", share: 100, role: "Admin" },
  ]);
  const [selectedContracts, setSelectedContracts] = useState<Set<string>>(
    new Set(["co-ownership-agreement"]) // Default: select recommended contract
  );
  const [submitting, setSubmitting] = useState(false);
  const [generatingContracts, setGeneratingContracts] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Track if we've initialized the creator as the first member
  const hasInitializedCreator = useRef(false);

  // Initialize the first member with the current user's information (only once on mount)
  useEffect(() => {
    if (user && !hasInitializedCreator.current) {
      // Only initialize if the first member doesn't have a userId yet
      setMembers((prev) => {
        if (prev[0]?.userId === null) {
          return [
            {
              email: user.email,
              userId: user.id,
              userName: `${user.firstName} ${user.lastName}`.trim() || user.email,
              share: 100,
              role: "Admin",
            },
          ];
        }
        return prev;
      });
      hasInitializedCreator.current = true;
    }
  }, [user]);

  const shareTotal = useMemo(
    () => members.reduce((sum, member) => sum + member.share, 0),
    [members]
  );

  // Validation functions for each step
  const validateStep0 = (): boolean => {
    return groupInfo.name.trim().length >= 3;
  };

  const validateStep1 = (): { isValid: boolean; message?: string } => {
    // Check all members have valid emails (userId)
    const invalidMembers = members.filter(
      (member) =>
        !member.userId ||
        (typeof member.userId === "string" && member.userId.trim().length === 0)
    );
    if (invalidMembers.length > 0) {
      return {
        isValid: false,
        message: "Vui lòng nhập email hợp lệ cho tất cả thành viên",
      };
    }

    // Check shares total 100%
    if (shareTotal !== 100) {
      return {
        isValid: false,
        message: "Tổng tỷ lệ sở hữu phải bằng 100%",
      };
    }

    return { isValid: true };
  };

  const handleNextStep = () => {
    if (activeStep === 0) {
      if (!validateStep0()) {
        setSnackbar({
          open: true,
          severity: "error",
          message: "Vui lòng nhập tên nhóm (ít nhất 3 ký tự)",
        });
        return;
      }
    } else if (activeStep === 1) {
      const validation = validateStep1();
      if (!validation.isValid) {
        setSnackbar({
          open: true,
          severity: "error",
          message:
            validation.message || "Vui lòng hoàn thành thông tin thành viên",
        });
        return;
      }
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleContractToggle = (contractId: string) => {
    setSelectedContracts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(contractId)) {
        newSet.delete(contractId);
      } else {
        newSet.add(contractId);
      }
      return newSet;
    });
  };

  const handleMemberShareChange = (index: number, value: number) => {
    setMembers((prev) =>
      prev.map((member, idx) =>
        idx === index ? { ...member, share: value } : member
      )
    );
  };

  const addMemberRow = () => {
    setMembers((prev) => [
      ...prev,
      { email: "", userId: null, userName: "", share: 0, role: "Member" },
    ]);
  };

  const handleEmailChange = async (index: number, email: string) => {
    setMembers((prev) =>
      prev.map((member, idx) =>
        idx === index
          ? { ...member, email, userId: null, userName: "" }
          : member
      )
    );

    // Search for user by email
    if (email.trim().length > 0 && email.includes("@")) {
      try {
        const user = await userApi.searchByEmail(email.trim());
        setMembers((prev) =>
          prev.map((member, idx) =>
            idx === index
              ? {
                  ...member,
                  userId: user.id,
                  userName:
                    `${user.firstName} ${user.lastName}`.trim() || email,
                }
              : member
          )
        );
      } catch (error) {
        // User not found - clear userId and userName
        setMembers((prev) =>
          prev.map((member, idx) =>
            idx === index ? { ...member, userId: null, userName: "" } : member
          )
        );
      }
    }
  };

  const removeMemberRow = (index: number) => {
    if (members.length === 1) return;
    setMembers((prev) => prev.filter((_, idx) => idx !== index));
  };

  const generateContractsForGroup = async (groupId: UUID) => {
    if (selectedContracts.size === 0) return;

    setGeneratingContracts(true);
    const memberNames = members
      .filter((m) => m.userId && m.userName)
      .map((m) => m.userName)
      .join(", ");
    const sharePercentages = members
      .filter((m) => m.userId && m.share > 0)
      .map((m) => `${m.userName}: ${m.share}%`)
      .join(", ");

    // Map frontend contract IDs to backend template names/IDs
    // Note: In a real implementation, you'd fetch template IDs from backend
    // For now, we'll use hardcoded mapping based on template names
    const contractTemplateMap: Record<string, { name: string; variables: Record<string, string> }> = {
      "co-ownership-agreement": {
        name: "Vehicle Co-Ownership Agreement",
        variables: {
          ownerNames: memberNames,
          sharePercentages: sharePercentages,
          effectiveDate: new Date().toLocaleDateString("vi-VN"),
          vehicleModel: "Chưa có xe",
          vin: "Chưa có",
          plateNumber: "Chưa có",
          purchaseDate: new Date().toLocaleDateString("vi-VN"),
          purchasePrice: "Chưa có",
        },
      },
      "cost-sharing-agreement": {
        name: "Cost-Sharing Agreement",
        variables: {
          groupName: groupInfo.name,
          memberNames: memberNames,
          effectiveDate: new Date().toLocaleDateString("vi-VN"),
          vehicleModel: "Chưa có xe",
          costCategories: "Nhiên liệu, Bảo trì, Bảo hiểm",
          billingCycle: "Hàng tháng",
        },
      },
      "usage-terms": {
        name: "Usage Terms and Conditions",
        variables: {
          groupName: groupInfo.name,
          vehicleModel: "Chưa có xe",
          maxUsageHoursPerWeek: "40",
          bookingLeadTime: "24",
          effectiveDate: new Date().toLocaleDateString("vi-VN"),
        },
      },
      "maintenance-contract": {
        name: "Maintenance Responsibility Contract",
        variables: {
          groupName: groupInfo.name,
          vehicleModel: "Chưa có xe",
          maintenanceCoordinator: memberNames.split(", ")[0] || "Chưa có",
          maintenanceSchedule: "Theo lịch trình của nhà sản xuất",
          effectiveDate: new Date().toLocaleDateString("vi-VN"),
        },
      },
    };

    try {
      // Note: This requires fetching actual template IDs from backend first
      // For now, we'll skip actual generation and just log
      // In production, you'd need to:
      // 1. Fetch templates from /api/document/templates
      // 2. Match by name
      // 3. Generate documents using template IDs
      console.log("Selected contracts to generate:", Array.from(selectedContracts));
      console.log("Group ID:", groupId);
      console.log("Contract variables:", contractTemplateMap);
      
      // TODO: Implement actual contract generation after fetching template IDs
      // This will be done in a follow-up when template management is implemented
    } catch (error) {
      console.error("Error generating contracts:", error);
      // Don't fail group creation if contract generation fails
    } finally {
      setGeneratingContracts(false);
    }
  };

  const handleSubmit = async () => {
    if (shareTotal !== 100) {
      setSnackbar({
        open: true,
        severity: "error",
        message: "Tổng tỷ lệ sở hữu phải bằng 100%",
      });
      return;
    }

    // Validate all members have userId
    const invalidMembers = members.filter(
      (member) =>
        !member.userId ||
        (typeof member.userId === "string" && member.userId.trim().length === 0)
    );
    if (invalidMembers.length > 0) {
      setSnackbar({
        open: true,
        severity: "error",
        message: "Vui lòng nhập email hợp lệ cho tất cả thành viên",
      });
      return;
    }

    // Transform to backend format (PascalCase and enum values)
    const payload = {
      Name: groupInfo.name,
      Description: groupInfo.description || null,
      Members: members
        .filter((member) => member.userId && member.share > 0)
        .map((member) => ({
          UserId: member.userId!,
          SharePercentage: member.share / 100,
          RoleInGroup: member.role === "Admin" ? 1 : 0, // Convert string to enum: Admin=1, Member=0
        })),
    };

    setSubmitting(true);
    try {
      console.log("Creating group with payload:", payload);
      const created = await groupApi.createGroup(payload as any);
      console.log("Group created successfully:", created);
      
      // Generate selected contracts after group creation
      // Note: Contract generation is currently stubbed - will be implemented later
      // when template management is available
      if (selectedContracts.size > 0) {
        try {
          await generateContractsForGroup(created.id);
        } catch (contractError) {
          // Don't fail group creation if contract generation fails
          console.warn("Contract generation failed (non-blocking):", contractError);
        }
      }

      // Reload groups list so sidebar updates
      await reloadGroups();
      
      // Dispatch event to notify other components (like GroupLayout sidebar) to reload
      window.dispatchEvent(new Event('groupCreated'));
      
      setSnackbar({
        open: true,
        message:
          "Đã gửi yêu cầu tạo nhóm. Nhóm của bạn đang chờ phê duyệt từ nhân viên.",
        severity: "success",
      });
      
      // Navigate to group detail page
      if (created?.id) {
        navigate(`/groups/${created.id}`);
      } else {
        console.error("Group created but no ID returned:", created);
        navigate("/groups");
      }
    } catch (submitError: any) {
      console.error("Error creating group:", submitError);
      console.error("Error details:", {
        message: submitError?.message,
        response: submitError?.response,
        status: submitError?.response?.status,
        data: submitError?.response?.data,
        url: submitError?.config?.url,
      });
      
      const errorMessage = 
        submitError?.response?.status === 404
          ? "Không tìm thấy endpoint. Vui lòng kiểm tra API Gateway và các service đã chạy chưa."
          : submitError?.response?.data?.message || 
            submitError?.message || 
            "Không thể tạo nhóm";
      
      setSnackbar({
        open: true,
        severity: "error",
        message: errorMessage,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-semibold text-neutral-900">
          Khởi tạo nhóm đồng sở hữu
        </h1>
      </header>

      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <div className="mt-8 space-y-6 rounded-3xl border border-neutral-200 bg-white p-6">
        {activeStep === 0 && (
          <div className="space-y-4">
            <TextField
              label="Tên nhóm"
              value={groupInfo.name}
              onChange={(event) =>
                setGroupInfo((prev) => ({ ...prev, name: event.target.value }))
              }
              fullWidth
              sx={{ mb: 3 }}
            />
            <TextField
              label="Mô tả"
              value={groupInfo.description}
              onChange={(event) =>
                setGroupInfo((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              fullWidth
              multiline
              minRows={4}
            />
          </div>
        )}

        {activeStep === 1 && (
          <div className="space-y-6">
            {members.map((member, index) => (
              <div
                key={`${member.userId}-${index}`}
                className="space-y-2 rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-neutral-700">
                    Thành viên {index + 1}
                  </p>
                  <IconButton
                    size="small"
                    onClick={() => removeMemberRow(index)}
                  >
                    <Delete fontSize="inherit" />
                  </IconButton>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <TextField
                    label="Email"
                    type="email"
                    value={member.email}
                    onChange={(event) =>
                      handleEmailChange(index, event.target.value)
                    }
                    helperText={
                      member.userId
                        ? `✓ ${member.userName || member.email}`
                        : member.email && member.email.includes("@")
                        ? "Đang tìm kiếm..."
                        : "Nhập email người dùng"
                    }
                    error={
                      member.email.length > 0 &&
                      !member.userId &&
                      member.email.includes("@")
                    }
                  />
                  <TextField
                    label="Vai trò"
                    select
                    value={member.role}
                    onChange={(event) =>
                      setMembers((prev) =>
                        prev.map((row, idx) =>
                          idx === index
                            ? {
                                ...row,
                                role: event.target.value as MemberDraft["role"],
                              }
                            : row
                        )
                      )
                    }
                    fullWidth
                  >
                    <MenuItem value="Member">Thành viên</MenuItem>
                    <MenuItem value="Admin">Quản trị viên</MenuItem>
                  </TextField>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-neutral-500">
                    Tỷ lệ sở hữu ({member.share}%)
                  </p>
                  <Slider
                    value={member.share}
                    onChange={(_, value) =>
                      handleMemberShareChange(index, value as number)
                    }
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>
              </div>
            ))}
            <Button
              startIcon={<Add />}
              variant="outlined"
              onClick={() => addMemberRow()}
              sx={{ mt: 2 }}
            >
              Thêm thành viên
            </Button>
            <Alert
              severity={shareTotal === 100 ? "success" : "warning"}
              sx={{ mt: 2 }}
            >{`Tổng hiện tại: ${shareTotal}% (cần 100%)`}</Alert>
          </div>
        )}

        {activeStep === 2 && (
          <div className="space-y-4">
            <Typography variant="h6" sx={{ mb: 2 }}>
              Chọn các hợp đồng điện tử bạn muốn tạo cho nhóm
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Các hợp đồng được chọn sẽ được tạo tự động sau khi nhóm được tạo.
              Bạn có thể quản lý và chỉnh sửa chúng sau trong phần Tài liệu của nhóm.
            </Alert>

            <div className="grid gap-4 md:grid-cols-2">
              {E_CONTRACT_TEMPLATES.map((contract) => (
                <Card
                  key={contract.id}
                  sx={{
                    border: selectedContracts.has(contract.id)
                      ? "2px solid #7a9aaf"
                      : "1px solid #e5e7eb",
                    backgroundColor: selectedContracts.has(contract.id)
                      ? "#f0f7ff"
                      : "white",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": {
                      borderColor: "#7a9aaf",
                      boxShadow: 2,
                    },
                  }}
                  onClick={() => handleContractToggle(contract.id)}
                >
                  <CardContent>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Description
                            sx={{
                              color: selectedContracts.has(contract.id)
                                ? "#7a9aaf"
                                : "#9ca3af",
                            }}
                          />
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: selectedContracts.has(contract.id)
                                ? 600
                                : 400,
                            }}
                          >
                            {contract.name}
                          </Typography>
                          {contract.recommended && (
                            <Typography
                              variant="caption"
                              sx={{
                                bgcolor: "#7a9aaf",
                                color: "white",
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: "0.7rem",
                              }}
                            >
                              Khuyến nghị
                            </Typography>
                          )}
                        </div>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          {contract.description}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "inline-block",
                            bgcolor: "#f3f4f6",
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                          }}
                        >
                          {contract.category}
                        </Typography>
                      </div>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedContracts.has(contract.id)}
                            onChange={() => handleContractToggle(contract.id)}
                            sx={{
                              color: "#7a9aaf",
                              "&.Mui-checked": {
                                color: "#7a9aaf",
                              },
                            }}
                          />
                        }
                        label=""
                        onClick={(e) => e.stopPropagation()}
                        sx={{ m: 0 }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedContracts.size === 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Vui lòng chọn ít nhất một hợp đồng. Hợp đồng đồng sở hữu được
                khuyến nghị.
              </Alert>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outlined"
          disabled={activeStep === 0}
          onClick={() => setActiveStep((prev) => prev - 1)}
        >
          Quay lại
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            disabled={
              submitting ||
              generatingContracts ||
              shareTotal !== 100 ||
              groupInfo.name.trim().length < 3 ||
              selectedContracts.size === 0
            }
            onClick={() => handleSubmit()}
          >
            {submitting || generatingContracts
              ? generatingContracts
                ? "Đang tạo hợp đồng..."
                : "Đang tạo..."
              : "Xuất bản nhóm"}
          </Button>
        ) : (
          <Button
            variant="contained"
            disabled={
              (activeStep === 0 && !validateStep0()) ||
              (activeStep === 1 && !validateStep1().isValid)
            }
            onClick={handleNextStep}
          >
            Tiếp tục
          </Button>
        )}
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </section>
  );
};

export default CreateGroup;
