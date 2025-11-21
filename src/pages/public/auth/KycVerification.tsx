import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { getCurrentUser } from "@/store/slices/authSlice";
import {
  Box,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  LinearProgress,
  IconButton,
} from "@mui/material";
import {
  CloudUpload,
  CameraAlt,
  CheckCircle,
  Error as ErrorIcon,
  ArrowBack,
  ArrowForward,
  Close,
} from "@mui/icons-material";
import { userApi } from "@/services/user/api";
import {
  KycDocumentType,
  KycDocumentStatus,
  type KycDocumentDto,
  type KycStep,
} from "@/models/kyc";
import Badge from "@/components/ui/Badge";

// Step configuration
const KYC_STEPS: KycStep[] = [
  {
    id: 1,
    title: "CMND/CCCD Mặt Trước",
    description: "Chụp hoặc upload ảnh mặt trước CMND/CCCD của bạn",
    documentType: KycDocumentType.NationalId,
    required: true,
    fileNamePrefix: "cmnd-front",
  },
  {
    id: 2,
    title: "CMND/CCCD Mặt Sau",
    description: "Chụp hoặc upload ảnh mặt sau CMND/CCCD của bạn",
    documentType: KycDocumentType.NationalId,
    required: true,
    fileNamePrefix: "cmnd-back",
  },
  {
    id: 3,
    title: "Giấy Phép Lái Xe",
    description: "Chụp hoặc upload ảnh giấy phép lái xe của bạn",
    documentType: KycDocumentType.DriverLicense,
    required: true,
    fileNamePrefix: "driver-license",
  },
  {
    id: 4,
    title: "Xác Thực Selfie",
    description: "Chụp ảnh selfie của bạn để xác thực danh tính",
    documentType: KycDocumentType.Other,
    required: true,
    fileNamePrefix: "selfie",
  },
  {
    id: 5,
    title: "Giấy Tờ Địa Chỉ (Tùy Chọn)",
    description: "Upload giấy tờ chứng minh địa chỉ nếu có",
    documentType: KycDocumentType.ProofOfAddress,
    required: false,
    fileNamePrefix: "address-proof",
  },
];

interface StepState {
  file: File | null;
  preview: string | null;
  uploadedDocument: KycDocumentDto | null;
  isUploading: boolean;
  error: string | null;
  imageUrl: string | null; // Blob URL for downloaded image
}

const KycVerification = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [activeStep, setActiveStep] = useState(0);
  const [stepsState, setStepsState] = useState<StepState[]>(
    KYC_STEPS.map(() => ({
      file: null,
      preview: null,
      uploadedDocument: null,
      isUploading: false,
      error: null,
      imageUrl: null,
    }))
  );
  const [existingDocuments, setExistingDocuments] = useState<KycDocumentDto[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Redirect if KYC is already approved or in review (user should not access this page)
  useEffect(() => {
    if (isAuthenticated && user) {
      const kycStatus = user.kycStatus ?? 0;
      const isKycApproved = kycStatus === 2; // 2 = Approved
      const isKycInReview = kycStatus === 1; // 1 = InReview

      if (isKycApproved) {
        // KYC approved, redirect to home
        navigate("/home", { replace: true });
      } else if (isKycInReview) {
        // KYC in review, redirect to profile setup
        navigate("/profile-setup", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Load existing documents on mount
  useEffect(() => {
    loadExistingDocuments();
  }, []);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      stepsState.forEach((state) => {
        if (state.imageUrl && state.imageUrl.startsWith("blob:")) {
          URL.revokeObjectURL(state.imageUrl);
        }
        if (state.preview && state.preview.startsWith("blob:")) {
          URL.revokeObjectURL(state.preview);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update step states when existing documents are loaded
  useEffect(() => {
    if (existingDocuments.length > 0) {
      const loadImages = async () => {
        const updatedStates = await Promise.all(
          KYC_STEPS.map(async (step) => {
            const existingDoc = existingDocuments.find(
              (doc) =>
                doc.documentType === step.documentType &&
                doc.fileName.includes(step.fileNamePrefix)
            );
            if (existingDoc) {
              // Load image via API endpoint with authentication
              let imageUrl = null;
              try {
                const blob = await userApi.downloadKycDocument(existingDoc.id);
                imageUrl = URL.createObjectURL(blob);
              } catch (error) {
                console.error("Error loading KYC document image:", error);
              }
              return {
                file: null,
                preview: null,
                uploadedDocument: existingDoc,
                isUploading: false,
                error: null,
                imageUrl,
              };
            }
            return {
              file: null,
              preview: null,
              uploadedDocument: null,
              isUploading: false,
              error: null,
              imageUrl: null,
            };
          })
        );
        setStepsState(updatedStates);

        // Don't redirect here - let user continue to step 5 (optional) if they want
        // Redirect will happen in handleNext when they complete step 5 or click "Hoàn Tất"
      };
      loadImages();
    }
    setIsLoading(false);
  }, [existingDocuments, navigate, dispatch]);

  const loadExistingDocuments = async () => {
    try {
      const docs = await userApi.getKycDocuments();
      setExistingDocuments(docs);
    } catch (error) {
      console.error("Error loading KYC documents:", error);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(",")[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setStepsState((prev) => {
        const newState = [...prev];
        newState[activeStep] = {
          ...newState[activeStep],
          error: "Vui lòng chọn file ảnh (JPG, PNG)",
        };
        return newState;
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setStepsState((prev) => {
        const newState = [...prev];
        newState[activeStep] = {
          ...newState[activeStep],
          error: "File quá lớn. Vui lòng chọn file nhỏ hơn 5MB",
        };
        return newState;
      });
      return;
    }

    // Create preview
    const preview = URL.createObjectURL(file);
    setStepsState((prev) => {
      const newState = [...prev];
      newState[activeStep] = {
        ...newState[activeStep],
        file,
        preview,
        error: null,
        isUploading: true,
      };
      return newState;
    });

    // Automatically upload the file
    try {
      const currentStep = KYC_STEPS[activeStep];
      // Convert file to base64
      const base64Content = await convertFileToBase64(file);
      const fileName = `${currentStep.fileNamePrefix}-${Date.now()}.${file.name
        .split(".")
        .pop()}`;

      // Upload to backend
      const uploadedDoc = await userApi.uploadKycDocument({
        documentType: currentStep.documentType,
        fileName,
        base64Content,
        notes: `Uploaded for ${currentStep.title}`,
      });

      // Load image via API endpoint with authentication
      let imageUrl = preview; // Fallback to preview
      try {
        const blob = await userApi.downloadKycDocument(uploadedDoc.id);
        imageUrl = URL.createObjectURL(blob);
      } catch (error) {
        console.error("Error loading uploaded document image:", error);
        // Keep preview if download fails
      }

      // Update state
      setStepsState((prev) => {
        const newState = [...prev];
        newState[activeStep] = {
          ...newState[activeStep],
          uploadedDocument: uploadedDoc,
          isUploading: false,
          error: null,
          imageUrl: imageUrl || preview, // Use downloaded image or keep preview
        };
        return newState;
      });

      // Reload documents to get updated status
      await loadExistingDocuments();

      // If we just completed step 4 (required), automatically move to step 5 (optional)
      if (activeStep === 3) {
        // Step 4 (index 3) completed, move to step 5 (optional)
        setActiveStep(4);
      }
    } catch (error: unknown) {
      console.error("Error uploading document:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      setStepsState((prev) => {
        const newState = [...prev];
        newState[activeStep] = {
          ...newState[activeStep],
          isUploading: false,
          error:
            axiosError.response?.data?.message ||
            "Có lỗi xảy ra khi upload. Vui lòng thử lại.",
        };
        return newState;
      });
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleUpload = async () => {
    const currentState = stepsState[activeStep];
    const currentStep = KYC_STEPS[activeStep];

    if (!currentState.file) {
      setStepsState((prev) => {
        const newState = [...prev];
        newState[activeStep] = {
          ...newState[activeStep],
          error: "Vui lòng chọn file trước khi upload",
        };
        return newState;
      });
      return;
    }

    // Set uploading state
    setStepsState((prev) => {
      const newState = [...prev];
      newState[activeStep] = {
        ...newState[activeStep],
        isUploading: true,
        error: null,
      };
      return newState;
    });

    try {
      // Convert file to base64
      const base64Content = await convertFileToBase64(currentState.file);
      const fileName = `${
        currentStep.fileNamePrefix
      }-${Date.now()}.${currentState.file.name.split(".").pop()}`;

      // Upload to backend
      const uploadedDoc = await userApi.uploadKycDocument({
        documentType: currentStep.documentType,
        fileName,
        base64Content,
        notes: `Uploaded for ${currentStep.title}`,
      });

      // Update state
      setStepsState((prev) => {
        const newState = [...prev];
        newState[activeStep] = {
          ...newState[activeStep],
          uploadedDocument: uploadedDoc,
          isUploading: false,
          error: null,
        };
        return newState;
      });

      // Reload documents
      await loadExistingDocuments();
    } catch (error: unknown) {
      console.error("Error uploading document:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      setStepsState((prev) => {
        const newState = [...prev];
        newState[activeStep] = {
          ...newState[activeStep],
          isUploading: false,
          error:
            axiosError.response?.data?.message ||
            "Có lỗi xảy ra khi upload. Vui lòng thử lại.",
        };
        return newState;
      });
    }
  };

  const handleRetake = () => {
    setStepsState((prev) => {
      const newState = [...prev];
      // Cleanup blob URL if exists
      if (newState[activeStep].imageUrl) {
        URL.revokeObjectURL(newState[activeStep].imageUrl);
      }
      newState[activeStep] = {
        ...newState[activeStep],
        file: null,
        preview: null,
        uploadedDocument: null,
        error: null,
        imageUrl: null,
      };
      return newState;
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
  };

  const handleNext = async () => {
    // Check if we're on step 4 (index 3) and moving to step 5 (optional)
    if (activeStep === 3) {
      // Moving from step 4 to step 5 (optional)
      setActiveStep((prev) => prev + 1);
    } else if (activeStep < KYC_STEPS.length - 1) {
      // Moving to next step (not the last one)
      setActiveStep((prev) => prev + 1);
    } else {
      // We're on step 5 (last step, optional) and clicking "Hoàn Tất"
      // Check if all 4 required steps are completed
      const requiredStepsCount = 4;
      let completedCount = 0;
      for (let i = 0; i < requiredStepsCount; i++) {
        if (stepsState[i]?.uploadedDocument !== null) {
          completedCount++;
        }
      }

      // Only redirect if all 4 required steps are completed
      if (completedCount >= 4) {
        // Reload user data to update KYC status
        await dispatch(getCurrentUser());

        // Redirect to Profile Setup
        navigate("/profile-setup", {
          replace: true,
          state: {
            message:
              "KYC đang chờ xác nhận. Vui lòng hoàn tất thiết lập hồ sơ.",
          },
        });
      } else {
        // If required steps not completed, show error or stay on page
        // This shouldn't happen if validation is correct, but handle it anyway
        console.warn("Cannot complete: not all required steps are completed");
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSkip = async () => {
    // If skipping step 5 (optional), complete the process
    if (activeStep === KYC_STEPS.length - 1) {
      // We're on step 5 (last step, optional) and clicking "Bỏ Qua"
      // Check if all 4 required steps are completed
      const requiredStepsCount = 4;
      let completedCount = 0;
      for (let i = 0; i < requiredStepsCount; i++) {
        if (stepsState[i]?.uploadedDocument !== null) {
          completedCount++;
        }
      }

      // Only redirect if all 4 required steps are completed
      if (completedCount >= 4) {
        // Reload user data to update KYC status
        await dispatch(getCurrentUser());

        // Redirect to Profile Setup
        navigate("/profile-setup", {
          replace: true,
          state: {
            message:
              "KYC đang chờ xác nhận. Vui lòng hoàn tất thiết lập hồ sơ.",
          },
        });
      }
    } else {
      // Skip to next step
      handleNext();
    }
  };

  const getStatusBadge = (status: KycDocumentStatus) => {
    switch (status) {
      case KycDocumentStatus.Approved:
        return <Badge variant="success">Đã Duyệt</Badge>;
      case KycDocumentStatus.Rejected:
        return <Badge variant="error">Từ Chối</Badge>;
      case KycDocumentStatus.UnderReview:
        return <Badge variant="warning">Đang Xem Xét</Badge>;
      case KycDocumentStatus.RequiresUpdate:
        return <Badge variant="warning">Cần Cập Nhật</Badge>;
      default:
        return <Badge variant="default">Chờ Xử Lý</Badge>;
    }
  };

  const currentStep = KYC_STEPS[activeStep];
  const currentState = stepsState[activeStep];
  const isStepCompleted = currentState.uploadedDocument !== null;
  const canProceed = isStepCompleted || !currentStep.required;

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#edede9",
        }}
      >
        <CircularProgress />
      </Box>
    );
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
          Xác Thực KYC
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "#8f7d70",
            mb: 4,
            textAlign: "center",
          }}
        >
          Vui lòng upload các giấy tờ cần thiết để hoàn tất xác thực danh tính
        </Typography>

        {/* Stepper */}
        <Card
          sx={{
            bgcolor: "#f5ebe0",
            mb: 3,
            borderRadius: 2,
          }}
        >
          <CardContent>
            <Stepper activeStep={activeStep} alternativeLabel>
              {KYC_STEPS.map((step) => (
                <Step key={step.id}>
                  <StepLabel>{step.title}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>

        {/* Current Step Card */}
        <Card
          sx={{
            bgcolor: "#f5ebe0",
            borderRadius: 2,
            mb: 3,
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "#6b5a4d",
                mb: 1,
              }}
            >
              Bước {activeStep + 1} / {KYC_STEPS.length}: {currentStep.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#8f7d70",
                mb: 3,
              }}
            >
              {currentStep.description}
            </Typography>

            {/* Error Alert */}
            {currentState.error && (
              <Alert
                severity="error"
                sx={{ mb: 2 }}
                action={
                  <IconButton
                    size="small"
                    onClick={() => {
                      setStepsState((prev) => {
                        const newState = [...prev];
                        newState[activeStep] = {
                          ...newState[activeStep],
                          error: null,
                        };
                        return newState;
                      });
                    }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                }
              >
                {currentState.error}
              </Alert>
            )}

            {/* Upload Area */}
            {!isStepCompleted ? (
              <Box>
                {/* Preview */}
                {currentState.preview && (
                  <Box
                    sx={{
                      mb: 2,
                      position: "relative",
                    }}
                  >
                    <Box
                      component="img"
                      src={currentState.preview}
                      alt="Preview"
                      sx={{
                        width: "100%",
                        maxHeight: 400,
                        objectFit: "contain",
                        borderRadius: 2,
                        border: "2px solid #e3d5ca",
                      }}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleRetake}
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        bgcolor: "rgba(255, 255, 255, 0.9)",
                      }}
                    >
                      Chụp Lại
                    </Button>
                  </Box>
                )}

                {/* Upload Buttons */}
                {!currentState.preview && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      mb: 3,
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      style={{ display: "none" }}
                    />
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileSelect}
                      style={{ display: "none" }}
                    />

                    <Button
                      variant="contained"
                      startIcon={<CloudUpload />}
                      onClick={() => fileInputRef.current?.click()}
                      sx={{
                        bgcolor: "#7a9aaf",
                        "&:hover": { bgcolor: "#6a8a9f" },
                        py: 2,
                      }}
                    >
                      Chọn File từ Thiết Bị
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CameraAlt />}
                      onClick={() => cameraInputRef.current?.click()}
                      sx={{
                        borderColor: "#7a9aaf",
                        color: "#7a9aaf",
                        py: 2,
                      }}
                    >
                      Chụp Ảnh
                    </Button>
                  </Box>
                )}

                {/* Upload Progress */}
                {currentState.isUploading && (
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress />
                    <Typography
                      variant="body2"
                      sx={{ mt: 1, textAlign: "center", color: "#8f7d70" }}
                    >
                      Đang upload...
                    </Typography>
                  </Box>
                )}
              </Box>
            ) : (
              /* Completed State - Show uploaded image */
              <Box>
                {/* Display uploaded image */}
                {(currentState.preview || currentState.imageUrl) && (
                  <Box
                    sx={{
                      mb: 2,
                      position: "relative",
                    }}
                  >
                    <Box
                      component="img"
                      src={currentState.preview || currentState.imageUrl || ""}
                      alt="Uploaded document"
                      sx={{
                        width: "100%",
                        maxHeight: 400,
                        objectFit: "contain",
                        borderRadius: 2,
                        border: "2px solid #e3d5ca",
                      }}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleRetake}
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        bgcolor: "rgba(255, 255, 255, 0.9)",
                        borderColor: "#7a9aaf",
                        color: "#7a9aaf",
                      }}
                    >
                      Upload Lại
                    </Button>
                  </Box>
                )}

                {/* Status badge and notes */}
                {currentState.uploadedDocument && (
                  <Box sx={{ mt: 2, textAlign: "center" }}>
                    {getStatusBadge(currentState.uploadedDocument.status)}
                    {currentState.uploadedDocument.reviewNotes && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        {currentState.uploadedDocument.reviewNotes}
                      </Alert>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={handleBack}
            disabled={activeStep === 0}
            sx={{
              borderColor: "#7a9aaf",
              color: "#7a9aaf",
            }}
          >
            Quay Lại
          </Button>
          {!currentStep.required && !isStepCompleted && (
            <Button
              variant="text"
              onClick={handleSkip}
              sx={{
                color: "#8f7d70",
              }}
            >
              Bỏ Qua
            </Button>
          )}
          <Button
            variant="contained"
            endIcon={<ArrowForward />}
            onClick={handleNext}
            disabled={!canProceed}
            sx={{
              bgcolor: "#7a9aaf",
              "&:hover": { bgcolor: "#6a8a9f" },
              ml: "auto",
            }}
          >
            {activeStep === KYC_STEPS.length - 1 ? "Hoàn Tất" : "Tiếp Theo"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default KycVerification;
