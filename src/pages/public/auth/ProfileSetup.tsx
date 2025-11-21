import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { getCurrentUser } from "@/store/slices/authSlice";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Avatar,
  Alert,
  CircularProgress,
  LinearProgress,
  Divider,
  Snackbar,
} from "@mui/material";
import {
  CloudUpload,
  CameraAlt,
  Save,
  SkipNext,
  CheckCircle,
  Cancel,
  HourglassEmpty,
  Visibility,
} from "@mui/icons-material";
import { userApi } from "@/services/user/api";
import type {
  ProfileSetupFormData,
  NotificationPreferences,
  UpdateProfileRequest,
} from "@/models/user";
import {
  PAYMENT_METHODS,
  LANGUAGES,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from "@/models/user";
import type { KycDocumentDto } from "@/models/kyc";
import { KycDocumentStatus } from "@/models/kyc";
import UserDocumentViewer from "@/components/shared/UserDocumentViewer";

const ProfileSetup = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ProfileSetupFormData>({
    bio: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    preferredPaymentMethod: "",
    languagePreference: "vi",
    notificationPreferences: { ...DEFAULT_NOTIFICATION_PREFERENCES },
  });

  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(
    null
  );
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoStorageUrl, setProfilePhotoStorageUrl] = useState<
    string | null
  >(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [kycDocuments, setKycDocuments] = useState<KycDocumentDto[]>([]);
  const [isLoadingKyc, setIsLoadingKyc] = useState(false);
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const [viewingDocument, setViewingDocument] = useState<KycDocumentDto | null>(
    null
  );
  const kycFileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>(
    {}
  );

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Load existing profile data if available
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await userApi.getFullProfile();
        if (profile) {
          setFormData({
            bio: profile.bio || "",
            emergencyContactName: profile.emergencyContact?.name || "",
            emergencyContactPhone: profile.emergencyContact?.phone || "",
            preferredPaymentMethod: profile.preferredPaymentMethod || "",
            languagePreference: profile.languagePreference || "vi",
            notificationPreferences: profile.notificationPreferences || {
              ...DEFAULT_NOTIFICATION_PREFERENCES,
            },
          });
          if (profile.profilePhotoUrl) {
            // Check if it's a blob URL (shouldn't be, but handle it)
            if (profile.profilePhotoUrl.startsWith("blob:")) {
              // This shouldn't happen, but if it does, clear it
              console.warn("Profile photo URL is a blob URL, clearing it");
              setProfilePhotoPreview(null);
              setProfilePhotoStorageUrl(null);
            } else {
              // Save storage URL
              setProfilePhotoStorageUrl(profile.profilePhotoUrl);

              // Load image via API endpoint with authentication (similar to KYC)
              try {
                const blob = await userApi.downloadProfilePhoto(
                  profile.profilePhotoUrl
                );
                const imageUrl = URL.createObjectURL(blob);
                setProfilePhotoPreview(imageUrl);
              } catch (error) {
                console.error("Error loading profile photo:", error);
                // Fallback: don't set preview if download fails
                setProfilePhotoPreview(null);
              }
            }
          }
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        // Continue with default values
      }
    };

    const loadKycDocuments = async () => {
      setIsLoadingKyc(true);
      try {
        const documents = await userApi.getKycDocuments();
        setKycDocuments(documents);
      } catch (err) {
        console.error("Error loading KYC documents:", err);
      } finally {
        setIsLoadingKyc(false);
      }
    };

    if (isAuthenticated && user) {
      loadProfile();
      loadKycDocuments();
    }
  }, [isAuthenticated, user]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (profilePhotoPreview && profilePhotoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(profilePhotoPreview);
      }
    };
  }, [profilePhotoPreview]);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file ảnh");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Kích thước file không được vượt quá 5MB");
      return;
    }

    setError(null);
    setProfilePhotoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfilePhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = async () => {
    if (!profilePhotoFile) return;

    setIsUploadingPhoto(true);
    setError(null);

    try {
      // Upload photo
      const photoUrl = await userApi.uploadProfilePhoto(profilePhotoFile);

      // Save storage URL from server (not blob URL)
      setProfilePhotoStorageUrl(photoUrl);

      // Download photo via API to get blob for preview (similar to KYC documents)
      let imageUrl = profilePhotoPreview; // Fallback to preview
      try {
        const blob = await userApi.downloadProfilePhoto(photoUrl);
        imageUrl = URL.createObjectURL(blob);
      } catch (error) {
        console.error("Error loading uploaded photo:", error);
        // If download fails, keep the preview
        imageUrl = profilePhotoPreview;
      }

      setProfilePhotoPreview(imageUrl);
      setSuccess("Ảnh đại diện đã được upload thành công");
    } catch (err: any) {
      console.error("Error uploading photo:", err);
      setError(
        err.response?.data?.message ||
          "Có lỗi xảy ra khi upload ảnh. Vui lòng thử lại."
      );
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleInputChange = (field: keyof ProfileSetupFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNotificationToggle = (
    category: keyof NotificationPreferences,
    key: string,
    value: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences!,
        [category]: {
          ...prev.notificationPreferences![category],
          [key]: value,
        },
      },
    }));
  };

  const handleSubmit = async (skip: boolean = false) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Use storage URL if available, otherwise upload new photo
      let profilePhotoUrl: string | undefined = undefined;

      // If we already have a storage URL from previous upload, use it
      if (profilePhotoStorageUrl) {
        profilePhotoUrl = profilePhotoStorageUrl;
      }
      // Otherwise, if there's a new file to upload, upload it
      else if (profilePhotoFile && !skip) {
        try {
          profilePhotoUrl = await userApi.uploadProfilePhoto(profilePhotoFile);
          setProfilePhotoStorageUrl(profilePhotoUrl);
        } catch (err) {
          console.error("Error uploading photo:", err);
          // Continue without photo if upload fails
        }
      }
      // If profilePhotoPreview exists but is not a blob URL (already a storage URL from server)
      else if (
        profilePhotoPreview &&
        !profilePhotoPreview.startsWith("blob:")
      ) {
        profilePhotoUrl = profilePhotoPreview;
      }

      // Prepare update request
      const updateRequest: UpdateProfileRequest = {
        bio: formData.bio || undefined,
        emergencyContactName: formData.emergencyContactName || undefined,
        emergencyContactPhone: formData.emergencyContactPhone || undefined,
        preferredPaymentMethod: formData.preferredPaymentMethod || undefined,
        languagePreference: formData.languagePreference || undefined,
        notificationPreferences: formData.notificationPreferences
          ? JSON.stringify(formData.notificationPreferences)
          : undefined,
        profilePhotoUrl,
      };

      // Remove undefined values
      Object.keys(updateRequest).forEach(
        (key) =>
          updateRequest[key as keyof UpdateProfileRequest] === undefined &&
          delete updateRequest[key as keyof UpdateProfileRequest]
      );

      // Update profile
      await userApi.updateProfileExtended(updateRequest);

      // Reload user data in Redux store to reflect changes
      await dispatch(getCurrentUser());

      // Reload profile data to show updated information
      const updatedProfile = await userApi.getFullProfile();
      if (updatedProfile) {
        setFormData({
          bio: updatedProfile.bio || "",
          emergencyContactName: updatedProfile.emergencyContact?.name || "",
          emergencyContactPhone: updatedProfile.emergencyContact?.phone || "",
          preferredPaymentMethod: updatedProfile.preferredPaymentMethod || "",
          languagePreference: updatedProfile.languagePreference || "vi",
          notificationPreferences: updatedProfile.notificationPreferences || {
            ...DEFAULT_NOTIFICATION_PREFERENCES,
          },
        });
        if (updatedProfile.profilePhotoUrl) {
          if (!updatedProfile.profilePhotoUrl.startsWith("blob:")) {
            setProfilePhotoStorageUrl(updatedProfile.profilePhotoUrl);
            try {
              const blob = await userApi.downloadProfilePhoto(
                updatedProfile.profilePhotoUrl
              );
              const imageUrl = URL.createObjectURL(blob);
              setProfilePhotoPreview(imageUrl);
            } catch (error) {
              console.error("Error loading profile photo:", error);
              setProfilePhotoPreview(null);
            }
          }
        }
      }

      // Reload KYC documents
      const documents = await userApi.getKycDocuments();
      setKycDocuments(documents);

      setSuccess("Hồ sơ đã được cập nhật thành công!");
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(
        err.response?.data?.message ||
          "Có lỗi xảy ra khi cập nhật hồ sơ. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    navigate("/home");
  };

  // Convert file to base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(",")[1];
        resolve(base64String);
      };
      reader.onerror = reject;
    });
  };

  // Handle KYC document re-upload
  const handleKycDocumentUpload = async (doc: KycDocumentDto, file: File) => {
    setUploadingDocId(doc.id);
    setError(null);

    try {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Kích thước file không được vượt quá 5MB");
        setUploadingDocId(null);
        return;
      }

      // Validate file type (images only)
      if (!file.type.startsWith("image/")) {
        setError("Chỉ chấp nhận file ảnh");
        setUploadingDocId(null);
        return;
      }

      // Convert file to base64
      const base64Content = await convertFileToBase64(file);
      const fileName = `${doc.fileName.split(".")[0]}-${Date.now()}.${file.name
        .split(".")
        .pop()}`;

      // Upload to backend
      await userApi.uploadKycDocument({
        documentType: doc.documentType,
        fileName,
        base64Content,
        notes: `Re-uploaded document after rejection`,
      });

      // Reload KYC documents
      const documents = await userApi.getKycDocuments();
      setKycDocuments(documents);

      // Reload user data to update KYC status
      await dispatch(getCurrentUser());

      setSuccess("Tài liệu đã được upload lại thành công!");
    } catch (err: any) {
      console.error("Error uploading KYC document:", err);
      setError(
        err.response?.data?.message ||
          "Có lỗi xảy ra khi upload tài liệu. Vui lòng thử lại."
      );
    } finally {
      setUploadingDocId(null);
    }
  };

  // Handle file select for KYC document
  const handleKycFileSelect = (
    doc: KycDocumentDto,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    handleKycDocumentUpload(doc, file);
    // Reset input
    if (kycFileInputRefs.current[doc.id]) {
      kycFileInputRefs.current[doc.id]!.value = "";
    }
  };

  // Handle download KYC document
  const handleDownloadKycDocument = async (doc: KycDocumentDto) => {
    try {
      const blob = await userApi.downloadKycDocument(doc.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error downloading document:", err);
      setError("Không thể tải tài liệu. Vui lòng thử lại.");
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#edede9",
        py: 4,
        px: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: 800,
          mx: "auto",
        }}
      >
        {/* Header */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "#6b5a4d",
            mb: 2,
            textAlign: "center",
          }}
        >
          Thiết Lập Hồ Sơ
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "#8f7d70",
            mb: 4,
            textAlign: "center",
          }}
        >
          Hoàn thiện thông tin hồ sơ của bạn để có trải nghiệm tốt nhất
        </Typography>

        {/* Profile Photo Section */}
        <Card
          sx={{
            bgcolor: "#f5ebe0",
            mb: 3,
            borderRadius: 2,
            boxShadow: "0 2px 8px rgba(45, 37, 32, 0.06)",
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "#6b5a4d",
                mb: 3,
              }}
            >
              1. Ảnh Đại Diện
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Avatar
                src={profilePhotoPreview || undefined}
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: "#d6ccc2",
                  border: "3px solid #e3d5ca",
                }}
              >
                {user.firstName?.[0]?.toUpperCase() || "U"}
              </Avatar>

              <Box sx={{ display: "flex", gap: 2 }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileSelect}
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: "none" }}
                  onChange={handleFileSelect}
                />

                <Button
                  variant="outlined"
                  startIcon={<CloudUpload />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    borderColor: "#7a9aaf",
                    color: "#7a9aaf",
                    "&:hover": {
                      borderColor: "#6a8a9f",
                      bgcolor: "rgba(122, 154, 175, 0.1)",
                    },
                  }}
                >
                  Chọn Ảnh
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CameraAlt />}
                  onClick={() => cameraInputRef.current?.click()}
                  sx={{
                    borderColor: "#7a9aaf",
                    color: "#7a9aaf",
                    "&:hover": {
                      borderColor: "#6a8a9f",
                      bgcolor: "rgba(122, 154, 175, 0.1)",
                    },
                  }}
                >
                  Chụp Ảnh
                </Button>
              </Box>

              {profilePhotoFile && (
                <Box sx={{ width: "100%", maxWidth: 400 }}>
                  {isUploadingPhoto && <LinearProgress sx={{ mb: 1 }} />}
                  <Button
                    variant="contained"
                    onClick={handlePhotoUpload}
                    disabled={isUploadingPhoto}
                    sx={{
                      bgcolor: "#7a9aaf",
                      "&:hover": { bgcolor: "#6a8a9f" },
                      width: "100%",
                    }}
                  >
                    {isUploadingPhoto ? "Đang Upload..." : "Upload Ảnh"}
                  </Button>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* KYC Status Section */}
        {user && (user.role === 2 || user.role === 3) && (
          <Card
            id="kyc-status"
            sx={{
              bgcolor: "#f5ebe0",
              mb: 3,
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(45, 37, 32, 0.06)",
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: "#6b5a4d",
                  mb: 3,
                }}
              >
                2. Trạng Thái KYC
              </Typography>

              {/* Overall KYC Status */}
              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  {user.kycStatus === 0 && (
                    <>
                      <HourglassEmpty sx={{ color: "#f59e0b" }} />
                      <Typography sx={{ color: "#6b5a4d", fontWeight: 500 }}>
                        Chờ xử lý
                      </Typography>
                    </>
                  )}
                  {user.kycStatus === 1 && (
                    <>
                      <HourglassEmpty sx={{ color: "#3b82f6" }} />
                      <Typography sx={{ color: "#6b5a4d", fontWeight: 500 }}>
                        Đang xem xét
                      </Typography>
                    </>
                  )}
                  {user.kycStatus === 2 && (
                    <>
                      <CheckCircle sx={{ color: "#10b981" }} />
                      <Typography sx={{ color: "#6b5a4d", fontWeight: 500 }}>
                        Đã duyệt
                      </Typography>
                    </>
                  )}
                  {user.kycStatus === 3 && (
                    <>
                      <Cancel sx={{ color: "#ef4444" }} />
                      <Typography sx={{ color: "#6b5a4d", fontWeight: 500 }}>
                        Bị từ chối
                      </Typography>
                    </>
                  )}
                </Box>
                {user.kycStatus === 3 && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    Tài liệu KYC của bạn đã bị từ chối. Vui lòng cập nhật và gửi
                    lại bằng cách upload lại các tài liệu bị từ chối bên dưới.
                  </Alert>
                )}
              </Box>

              {/* KYC Documents List */}
              {isLoadingKyc ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : kycDocuments.length > 0 ? (
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: "#8f7d70", mb: 2, fontWeight: 600 }}
                  >
                    Tài liệu đã upload:
                  </Typography>
                  {kycDocuments.map((doc) => (
                    <Box
                      key={doc.id}
                      sx={{
                        p: 2,
                        mb: 2,
                        bgcolor: "#ffffff",
                        borderRadius: 1,
                        border: "1px solid #e3d5ca",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <Typography sx={{ fontWeight: 500, color: "#6b5a4d" }}>
                          {doc.fileName}
                        </Typography>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Visibility />}
                            onClick={() => setViewingDocument(doc)}
                            sx={{
                              borderColor: "#7a9aaf",
                              color: "#7a9aaf",
                              "&:hover": {
                                borderColor: "#6a8a9f",
                                bgcolor: "rgba(122, 154, 175, 0.1)",
                              },
                            }}
                          >
                            Xem
                          </Button>
                          {doc.status === KycDocumentStatus.Approved && (
                            <CheckCircle
                              sx={{ color: "#10b981", fontSize: 20 }}
                            />
                          )}
                          {doc.status === KycDocumentStatus.Rejected && (
                            <Cancel sx={{ color: "#ef4444", fontSize: 20 }} />
                          )}
                          {doc.status === KycDocumentStatus.UnderReview && (
                            <HourglassEmpty
                              sx={{ color: "#3b82f6", fontSize: 20 }}
                            />
                          )}
                          {doc.status === KycDocumentStatus.RequiresUpdate && (
                            <Cancel sx={{ color: "#f59e0b", fontSize: 20 }} />
                          )}
                          {doc.status === KycDocumentStatus.Pending && (
                            <HourglassEmpty
                              sx={{ color: "#9ca3af", fontSize: 20 }}
                            />
                          )}
                        </Box>
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#8f7d70",
                          display: "block",
                          mb: doc.reviewNotes ? 1 : 0,
                        }}
                      >
                        {doc.status === KycDocumentStatus.Approved &&
                          "Đã duyệt"}
                        {doc.status === KycDocumentStatus.Rejected &&
                          "Bị từ chối"}
                        {doc.status === KycDocumentStatus.UnderReview &&
                          "Đang xem xét"}
                        {doc.status === KycDocumentStatus.RequiresUpdate &&
                          "Cần cập nhật"}
                        {doc.status === KycDocumentStatus.Pending &&
                          "Chờ xử lý"}
                        {doc.reviewedAt &&
                          ` - ${new Date(doc.reviewedAt).toLocaleDateString(
                            "vi-VN"
                          )}`}
                      </Typography>
                      {doc.reviewNotes && (
                        <Alert severity="info" sx={{ mt: 1 }}>
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 600 }}
                          >
                            Ghi chú từ người duyệt:
                          </Typography>
                          <Typography variant="body2">
                            {doc.reviewNotes}
                          </Typography>
                        </Alert>
                      )}
                      {(doc.status === KycDocumentStatus.Rejected ||
                        doc.status === KycDocumentStatus.RequiresUpdate) && (
                        <Box sx={{ mt: 1 }}>
                          <input
                            ref={(el) => {
                              kycFileInputRefs.current[doc.id] = el;
                            }}
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={(e) => handleKycFileSelect(doc, e)}
                          />
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<CloudUpload />}
                            onClick={() =>
                              kycFileInputRefs.current[doc.id]?.click()
                            }
                            disabled={uploadingDocId === doc.id}
                            sx={{
                              borderColor: "#7a9aaf",
                              color: "#7a9aaf",
                              "&:hover": {
                                borderColor: "#6a8a9f",
                                bgcolor: "rgba(122, 154, 175, 0.1)",
                              },
                            }}
                          >
                            {uploadingDocId === doc.id
                              ? "Đang Upload..."
                              : "Upload lại"}
                          </Button>
                          {uploadingDocId === doc.id && (
                            <LinearProgress sx={{ mt: 1 }} />
                          )}
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography sx={{ color: "#8f7d70", fontStyle: "italic" }}>
                  Chưa có tài liệu KYC nào được upload.
                </Typography>
              )}
            </CardContent>
          </Card>
        )}

        {/* Bio Section */}
        <Card
          sx={{
            bgcolor: "#f5ebe0",
            mb: 3,
            borderRadius: 2,
            boxShadow: "0 2px 8px rgba(45, 37, 32, 0.06)",
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "#6b5a4d",
                mb: 2,
              }}
            >
              {user && (user.role === 2 || user.role === 3)
                ? "3. Giới Thiệu (Tùy Chọn)"
                : "2. Giới Thiệu (Tùy Chọn)"}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Viết một vài dòng giới thiệu về bản thân..."
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              inputProps={{ maxLength: 200 }}
              helperText={`${formData.bio?.length || 0}/200 ký tự`}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "#edede9",
                  "&:hover fieldset": {
                    borderColor: "#7a9aaf",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#7a9aaf",
                    boxShadow: "0 0 0 3px rgba(122, 154, 175, 0.15)",
                  },
                },
              }}
            />
          </CardContent>
        </Card>

        {/* Emergency Contact Section */}
        <Card
          sx={{
            bgcolor: "#f5ebe0",
            mb: 3,
            borderRadius: 2,
            boxShadow: "0 2px 8px rgba(45, 37, 32, 0.06)",
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "#6b5a4d",
                mb: 3,
              }}
            >
              {user && (user.role === 2 || user.role === 3)
                ? "4. Liên Hệ Khẩn Cấp"
                : "3. Liên Hệ Khẩn Cấp"}
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                fullWidth
                label="Tên người liên hệ"
                value={formData.emergencyContactName}
                onChange={(e) =>
                  handleInputChange("emergencyContactName", e.target.value)
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#edede9",
                    "&:hover fieldset": {
                      borderColor: "#7a9aaf",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#7a9aaf",
                      boxShadow: "0 0 0 3px rgba(122, 154, 175, 0.15)",
                    },
                  },
                }}
              />
              <TextField
                fullWidth
                label="Số điện thoại"
                value={formData.emergencyContactPhone}
                onChange={(e) =>
                  handleInputChange("emergencyContactPhone", e.target.value)
                }
                placeholder="+84..."
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#edede9",
                    "&:hover fieldset": {
                      borderColor: "#7a9aaf",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#7a9aaf",
                      boxShadow: "0 0 0 3px rgba(122, 154, 175, 0.15)",
                    },
                  },
                }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Payment Method & Language Section */}
        <Card
          sx={{
            bgcolor: "#f5ebe0",
            mb: 3,
            borderRadius: 2,
            boxShadow: "0 2px 8px rgba(45, 37, 32, 0.06)",
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "#6b5a4d",
                mb: 3,
              }}
            >
              {user && (user.role === 2 || user.role === 3)
                ? "5. Tùy Chọn Thanh Toán & Ngôn Ngữ"
                : "4. Tùy Chọn Thanh Toán & Ngôn Ngữ"}
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Phương thức thanh toán ưa thích</InputLabel>
                <Select
                  value={formData.preferredPaymentMethod}
                  onChange={(e) =>
                    handleInputChange("preferredPaymentMethod", e.target.value)
                  }
                  label="Phương thức thanh toán ưa thích"
                  sx={{
                    bgcolor: "#edede9",
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#7a9aaf",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#7a9aaf",
                      boxShadow: "0 0 0 3px rgba(122, 154, 175, 0.15)",
                    },
                  }}
                >
                  <MenuItem value="">Không chọn</MenuItem>
                  {PAYMENT_METHODS.map((method) => (
                    <MenuItem key={method.value} value={method.value}>
                      {method.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Ngôn ngữ</InputLabel>
                <Select
                  value={formData.languagePreference}
                  onChange={(e) =>
                    handleInputChange("languagePreference", e.target.value)
                  }
                  label="Ngôn ngữ"
                  sx={{
                    bgcolor: "#edede9",
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#7a9aaf",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#7a9aaf",
                      boxShadow: "0 0 0 3px rgba(122, 154, 175, 0.15)",
                    },
                  }}
                >
                  {LANGUAGES.map((lang) => (
                    <MenuItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        {/* Notification Preferences Section */}
        <Card
          sx={{
            bgcolor: "#f5ebe0",
            mb: 3,
            borderRadius: 2,
            boxShadow: "0 2px 8px rgba(45, 37, 32, 0.06)",
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "#6b5a4d",
                mb: 3,
              }}
            >
              {user && (user.role === 2 || user.role === 3)
                ? "6. Tùy Chọn Thông Báo"
                : "5. Tùy Chọn Thông Báo"}
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Bookings */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, color: "#6b5a4d", mb: 1 }}
                >
                  Đặt Xe
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={
                          formData.notificationPreferences?.bookings
                            ?.confirmed ?? false
                        }
                        onChange={(e) =>
                          handleNotificationToggle(
                            "bookings",
                            "confirmed",
                            e.target.checked
                          )
                        }
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": {
                            color: "#7a9aaf",
                          },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                            {
                              bgcolor: "#7a9aaf",
                            },
                        }}
                      />
                    }
                    label="Xác nhận đặt xe"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={
                          formData.notificationPreferences?.bookings
                            ?.reminder ?? false
                        }
                        onChange={(e) =>
                          handleNotificationToggle(
                            "bookings",
                            "reminder",
                            e.target.checked
                          )
                        }
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": {
                            color: "#7a9aaf",
                          },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                            {
                              bgcolor: "#7a9aaf",
                            },
                        }}
                      />
                    }
                    label="Nhắc nhở đặt xe"
                  />
                </Box>
              </Box>

              <Divider sx={{ borderColor: "#e3d5ca" }} />

              {/* Payments */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, color: "#6b5a4d", mb: 1 }}
                >
                  Thanh Toán
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={
                          formData.notificationPreferences?.payments?.due ??
                          false
                        }
                        onChange={(e) =>
                          handleNotificationToggle(
                            "payments",
                            "due",
                            e.target.checked
                          )
                        }
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": {
                            color: "#7a9aaf",
                          },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                            {
                              bgcolor: "#7a9aaf",
                            },
                        }}
                      />
                    }
                    label="Thanh toán đến hạn"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={
                          formData.notificationPreferences?.payments
                            ?.received ?? false
                        }
                        onChange={(e) =>
                          handleNotificationToggle(
                            "payments",
                            "received",
                            e.target.checked
                          )
                        }
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": {
                            color: "#7a9aaf",
                          },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                            {
                              bgcolor: "#7a9aaf",
                            },
                        }}
                      />
                    }
                    label="Thanh toán đã nhận"
                  />
                </Box>
              </Box>

              <Divider sx={{ borderColor: "#e3d5ca" }} />

              {/* Group Activity */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, color: "#6b5a4d", mb: 1 }}
                >
                  Hoạt Động Nhóm
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={
                          formData.notificationPreferences?.groupActivity
                            ?.newMember ?? false
                        }
                        onChange={(e) =>
                          handleNotificationToggle(
                            "groupActivity",
                            "newMember",
                            e.target.checked
                          )
                        }
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": {
                            color: "#7a9aaf",
                          },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                            {
                              bgcolor: "#7a9aaf",
                            },
                        }}
                      />
                    }
                    label="Thành viên mới tham gia"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={
                          formData.notificationPreferences?.groupActivity
                            ?.ownershipChanged ?? false
                        }
                        onChange={(e) =>
                          handleNotificationToggle(
                            "groupActivity",
                            "ownershipChanged",
                            e.target.checked
                          )
                        }
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": {
                            color: "#7a9aaf",
                          },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                            {
                              bgcolor: "#7a9aaf",
                            },
                        }}
                      />
                    }
                    label="Thay đổi quyền sở hữu"
                  />
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "space-between",
            position: "sticky",
            bottom: 0,
            bgcolor: "#edede9",
            pt: 2,
            pb: 2,
          }}
        >
          <Button
            variant="text"
            startIcon={<SkipNext />}
            onClick={handleSkip}
            disabled={isSubmitting}
            sx={{
              color: "#8f7d70",
            }}
          >
            Bỏ Qua
          </Button>
          <Button
            variant="contained"
            startIcon={isSubmitting ? <CircularProgress size={20} /> : <Save />}
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            sx={{
              bgcolor: "#7a9aaf",
              "&:hover": { bgcolor: "#6a8a9f" },
              minWidth: 150,
            }}
          >
            {isSubmitting ? "Đang Lưu..." : "Lưu & Tiếp Tục"}
          </Button>
        </Box>
      </Box>

      {/* Document Viewer */}
      {viewingDocument && (
        <UserDocumentViewer
          documentUrl={viewingDocument.storageUrl}
          fileName={viewingDocument.fileName}
          documentId={viewingDocument.id}
          onClose={() => setViewingDocument(null)}
          onDownload={() => handleDownloadKycDocument(viewingDocument)}
        />
      )}

      {/* Snackbar Notifications */}
      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSuccess(null)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfileSetup;
