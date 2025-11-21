import { useNavigate } from "react-router-dom";
import { Alert, AlertTitle, Button, IconButton } from "@mui/material";
import {
  Close,
  VerifiedUser,
  Warning,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { useAppSelector } from "@/store/hooks";
import { useState } from "react";

/**
 * KYC Status enum values:
 * Pending = 0
 * InReview = 1
 * Approved = 2
 * Rejected = 3
 */
const KycBanner = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [dismissed, setDismissed] = useState(false);

  // Don't show for admins/staff or if already dismissed
  if (!isAuthenticated || !user || dismissed) {
    return null;
  }

  // Don't show for SystemAdmin (0) or Staff (1)
  if (user.role === 0 || user.role === 1) {
    return null;
  }

  const kycStatus = user.kycStatus ?? 0;

  // Only show banner if KYC is not approved
  if (kycStatus === 2) {
    return null;
  }

  const getBannerContent = () => {
    switch (kycStatus) {
      case 0: // Pending
        return {
          severity: "warning" as const,
          title: "Xác thực KYC cần thiết",
          message:
            "Vui lòng hoàn tất xác thực KYC để sử dụng đầy đủ các tính năng của nền tảng.",
          icon: <Warning />,
          actionText: "Xác thực ngay",
          actionPath: "/kyc-verification",
        };
      case 1: // InReview
        return {
          severity: "info" as const,
          title: "Đang xem xét KYC",
          message:
            "Tài liệu KYC của bạn đang được xem xét. Chúng tôi sẽ thông báo khi có kết quả.",
          icon: <VerifiedUser />,
          actionText: "Xem trạng thái",
          actionPath: "/profile-setup#kyc-status",
        };
      case 3: // Rejected
        return {
          severity: "error" as const,
          title: "KYC bị từ chối",
          message:
            "Tài liệu KYC của bạn đã bị từ chối. Vui lòng cập nhật và gửi lại.",
          icon: <ErrorIcon />,
          actionText: "Cập nhật KYC",
          actionPath: "/profile-setup#kyc-status",
        };
      default:
        return {
          severity: "warning" as const,
          title: "Xác thực KYC cần thiết",
          message:
            "Vui lòng hoàn tất xác thực KYC để sử dụng đầy đủ các tính năng.",
          icon: <Warning />,
          actionText: "Xác thực ngay",
          actionPath: "/kyc-verification",
        };
    }
  };

  const content = getBannerContent();

  return (
    <Alert
      severity={content.severity}
      icon={content.icon}
      action={
        <>
          <Button
            color="inherit"
            size="small"
            onClick={() => navigate(content.actionPath || "/kyc-verification")}
            sx={{ mr: 1 }}
          >
            {content.actionText}
          </Button>
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={() => setDismissed(true)}
          >
            <Close fontSize="inherit" />
          </IconButton>
        </>
      }
      sx={{
        borderRadius: 0,
        "& .MuiAlert-message": {
          width: "100%",
        },
      }}
    >
      <AlertTitle>{content.title}</AlertTitle>
      {content.message}
    </Alert>
  );
};

export default KycBanner;
