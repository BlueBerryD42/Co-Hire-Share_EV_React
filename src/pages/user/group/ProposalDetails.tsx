import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Alert, Button, Snackbar, Box, Typography, Chip } from "@mui/material";
import { AccessTime, Description } from "@mui/icons-material";
import type { AxiosError } from "axios";
import type { UUID } from "@/models/booking";
import type {
  ProposalResultsDto,
  ProposalStatus,
  ProposalType,
  VoteChoice,
} from "@/models/proposal";
import { useProposal } from "@/hooks/useProposals";
import { proposalApi } from "@/services/group/proposals";
import { documentApi } from "@/services/group/documents";
import type { DocumentListItemResponse } from "@/models/document";
import { getDocumentTypeName, getDocumentTypeColor, formatFileSize } from "@/models/document";

const getProposalTypeLabel = (type: ProposalType): string => {
  const typeMap: Record<ProposalType, string> = {
    MaintenanceBudget: "Ngân sách bảo trì",
    VehicleUpgrade: "Nâng cấp xe",
    VehicleSale: "Bán xe",
    PolicyChange: "Thay đổi quy tắc",
    MembershipChange: "Thành viên",
    Other: "Khác",
  };
  return typeMap[type] || type;
};

// Helper to parse UTC dates from backend (dates without timezone are assumed UTC)
const parseUTCDate = (dateString: string): Date => {
  // If already has timezone indicator (Z, +, or -), use as-is
  if (dateString.includes('Z') || dateString.match(/[+-]\d{2}:\d{2}$/)) {
    return new Date(dateString);
  }
  // Otherwise, assume UTC and append 'Z'
  return new Date(dateString + 'Z');
};

// Countdown hook
const useCountdown = (targetDate: string | Date) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now();
      // Parse UTC date if it's a string, otherwise use Date directly
      const target = typeof targetDate === 'string' 
        ? parseUTCDate(targetDate).getTime()
        : targetDate.getTime();
      const difference = target - now;

      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isPast: true,
        };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        isPast: false,
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
};

// Countdown display component
const CountdownDisplay = ({ 
  targetDate, 
  label, 
  variant = "default" 
}: { 
  targetDate: string | Date; 
  label: string;
  variant?: "default" | "urgent";
}) => {
  const { days, hours, minutes, seconds, isPast } = useCountdown(targetDate);

  if (isPast) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <AccessTime fontSize="small" />
        <Typography variant="body2" color="text.secondary">
          Đã qua
        </Typography>
      </Box>
    );
  }

  const isUrgent = days === 0 && hours < 24;
  const color = variant === "urgent" || isUrgent ? "#b87d6f" : "#7a9b76";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <AccessTime fontSize="small" sx={{ color }} />
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          {label}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", gap: 1.5, alignItems: "baseline" }}>
        {days > 0 && (
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{ color, lineHeight: 1 }}
            >
              {days}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
              ngày
            </Typography>
          </Box>
        )}
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{ color, lineHeight: 1 }}
          >
            {String(hours).padStart(2, "0")}
          </Typography>
          <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
            giờ
          </Typography>
        </Box>
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{ color, lineHeight: 1 }}
          >
            {String(minutes).padStart(2, "0")}
          </Typography>
          <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
            phút
          </Typography>
        </Box>
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{ color, lineHeight: 1 }}
          >
            {String(seconds).padStart(2, "0")}
          </Typography>
          <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
            giây
          </Typography>
        </Box>
      </Box>
      <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
        {(typeof targetDate === 'string' ? parseUTCDate(targetDate) : targetDate).toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Typography>
    </Box>
  );
};

const statusBanner: Record<ProposalStatus, { label: string; classes: string }> =
  {
    Active: {
      label: "Đang bỏ phiếu",
      classes: "bg-accent-gold/10 border-accent-gold text-accent-gold",
    },
    Passed: {
      label: "Đã thông qua",
      classes: "bg-accent-green/10 border-accent-green text-accent-green",
    },
    Rejected: {
      label: "Bị từ chối",
      classes:
        "bg-accent-terracotta/10 border-accent-terracotta text-accent-terracotta",
    },
    Expired: {
      label: "Hết hạn",
      classes: "bg-neutral-200 border-neutral-300 text-neutral-600",
    },
    Cancelled: {
      label: "Đã huỷ",
      classes: "bg-neutral-200 border-neutral-300 text-neutral-600",
    },
  };

const ProposalDetails = () => {
  const { groupId, proposalId } = useParams<{
    groupId: UUID;
    proposalId: UUID;
  }>();
  const { data: proposal, loading, error, reload } = useProposal(proposalId);
  const [results, setResults] = useState<ProposalResultsDto | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [submitting, setSubmitting] = useState(false);
  const [relatedDocuments, setRelatedDocuments] = useState<DocumentListItemResponse[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  // Track current time to make voting state reactive
  const [currentTime, setCurrentTime] = useState(Date.now());

  const fetchRelatedDocuments = useCallback(async () => {
    if (!proposalId || !groupId) return;
    
    setLoadingDocuments(true);
    try {
      // Fetch all group documents
      const response = await documentApi.getGroupDocuments(groupId as UUID, {
        page: 1,
        pageSize: 50,
        sortBy: 'CreatedAt',
        sortDescending: true,
      });
      
      // Filter documents created around the same time as the proposal (within 1 day before/after)
      if (proposal?.createdAt) {
        const proposalDate = new Date(proposal.createdAt).getTime();
        const oneDayMs = 24 * 60 * 60 * 1000;
        
        const related = (response.items || []).filter(doc => {
          const docDate = new Date(doc.createdAt).getTime();
          const timeDiff = Math.abs(docDate - proposalDate);
          return timeDiff <= oneDayMs;
        });
        
        setRelatedDocuments(related);
      } else {
        // If proposal not loaded yet, show recent documents
        setRelatedDocuments((response.items || []).slice(0, 5));
      }
    } catch (err) {
      console.error("Error fetching related documents:", err);
      setRelatedDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  }, [proposalId, groupId, proposal?.createdAt]);

  useEffect(() => {
    if (proposal?.groupId) {
      fetchRelatedDocuments();
    }
  }, [proposal?.groupId, proposal?.createdAt, fetchRelatedDocuments]);

  const fetchResults = useCallback(async () => {
    if (!proposalId) return;
    try {
      const data = await proposalApi.getResults(proposalId);
      setResults(data);
    } catch {
      setResults(null);
    }
  }, [proposalId]);

  useEffect(() => {
    void fetchResults();
  }, [fetchResults]);

  // Update current time every second to make voting state reactive
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Reload proposal when voting period ends
  useEffect(() => {
    if (!proposal) return;
    
    const votingEnds = parseUTCDate(proposal.votingEndDate).getTime();
    const timeUntilEnd = votingEnds - currentTime;
    
    // If voting just ended (within last 2 seconds), reload to get updated status
    if (timeUntilEnd > 0 && timeUntilEnd < 2000 && proposal.status === "Active") {
      const reloadTimer = setTimeout(() => {
        reload();
        void fetchResults();
      }, 2000);
      
      return () => clearTimeout(reloadTimer);
    }
  }, [currentTime, proposal, reload]);

  const handleVote = async (choice: VoteChoice) => {
    if (!proposalId) return;
    setSubmitting(true);
    try {
      await proposalApi.vote(proposalId, { choice });
      setSnackbar({
        open: true,
        message: "Đã ghi nhận phiếu bầu của bạn",
        severity: "success",
      });
      // Delay to ensure backend has processed auto-completion, then reload
      await new Promise(resolve => setTimeout(resolve, 1000));
      await Promise.all([reload(), fetchResults()]);
      
      // If proposal is still active, check again after a short delay (in case auto-close is processing)
      setTimeout(async () => {
        try {
          const updatedProposal = await proposalApi.getById(proposalId);
          if (updatedProposal && updatedProposal.status !== "Active") {
            await Promise.all([reload(), fetchResults()]);
          }
        } catch (err) {
          console.error("Error checking proposal status:", err);
        }
      }, 2000);
    } catch (voteError) {
      console.error("Error voting:", voteError);
      
      // Extract error message from API response
      let errorMessage = "Không thể bỏ phiếu";
      
      if (voteError && typeof voteError === 'object' && 'response' in voteError) {
        const axiosError = voteError as AxiosError<{ message?: string; error?: string }>;
        const responseData = axiosError.response?.data;
        
        if (responseData?.message) {
          // Map common error messages to Vietnamese
          const message = responseData.message;
          if (message.includes("Voting has not started yet") || message.includes("voting has not started")) {
            errorMessage = proposal 
              ? `Bỏ phiếu chưa bắt đầu. Bỏ phiếu sẽ bắt đầu vào ${parseUTCDate(proposal.votingStartDate).toLocaleString("vi-VN")}`
              : "Bỏ phiếu chưa bắt đầu. Vui lòng đợi đến thời điểm bắt đầu bỏ phiếu.";
          } else if (message.includes("Voting has ended") || message.includes("voting has ended")) {
            errorMessage = proposal
              ? `Bỏ phiếu đã kết thúc vào ${parseUTCDate(proposal.votingEndDate).toLocaleString("vi-VN")}`
              : "Bỏ phiếu đã kết thúc.";
          } else if (message.includes("already voted") || message.includes("already cast")) {
            errorMessage = "Bạn đã bỏ phiếu cho đề xuất này rồi";
          } else if (message.includes("not a member") || message.includes("not authorized")) {
            errorMessage = "Bạn không có quyền bỏ phiếu cho đề xuất này";
          } else {
            errorMessage = message;
          }
        } else if (responseData?.error) {
          errorMessage = responseData.error;
        } else if (axiosError.response?.status === 400) {
          errorMessage = "Yêu cầu không hợp lệ. Vui lòng thử lại.";
        } else if (axiosError.response?.status === 403) {
          errorMessage = "Bạn không có quyền bỏ phiếu cho đề xuất này.";
        } else if (axiosError.response?.status === 404) {
          errorMessage = "Không tìm thấy đề xuất. Vui lòng thử lại.";
        } else if (axiosError.message) {
          errorMessage = axiosError.message;
        }
      } else if (voteError instanceof Error) {
        errorMessage = voteError.message;
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="space-y-4">
        <div className="rounded-3xl border border-neutral-200 bg-neutral-100 p-10 text-center text-neutral-500">
          Đang tải đề xuất...
        </div>
      </section>
    );
  }

  if (error || !proposal) {
    return (
      <section className="mx-auto max-w-4xl space-y-4 p-6 text-center">
        <p className="text-lg font-semibold text-accent-terracotta">
          Không tìm thấy đề xuất
        </p>
        <p className="text-neutral-600">
          {error?.message ??
            "Đề xuất đã bị xoá hoặc bạn không có quyền truy cập."}
        </p>
        <Button variant="contained" onClick={() => reload()}>
          Thử lại
        </Button>
      </section>
    );
  }

  const banner = statusBanner[proposal.status];
  const totalWeight = proposal.voteTally.totalWeight || 1;
  const yesRatio = Math.round(
    (proposal.voteTally.yesWeight / totalWeight) * 100
  );
  const noRatio = Math.round((proposal.voteTally.noWeight / totalWeight) * 100);
  const abstainRatio = 100 - yesRatio - noRatio;

  return (
    <section className="space-y-8">
      <header className="space-y-4">
        <Link to={`/groups/${groupId}/proposals`} className="text-sm font-semibold text-accent-blue mb-4 block">
          ← Quay về danh sách đề xuất
        </Link>
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${banner.classes}`}
        >
          {banner.label}
        </div>
        <h1 className="text-4xl font-semibold text-neutral-900">
          {proposal.title}
        </h1>
        <p className="text-neutral-600">{proposal.description}</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="card">
          <p className="text-sm text-neutral-500 mb-2">Loại</p>
          <p className="text-2xl font-semibold text-neutral-900 mb-2">
            {getProposalTypeLabel(proposal.type)}
          </p>
          <p className="text-xs text-neutral-500 mt-2">
            Người tạo: {proposal.creatorName} ·{" "}
            {new Date(proposal.createdAt).toLocaleDateString("vi-VN")}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-neutral-500 mb-2">Số tiền</p>
          <p className="text-2xl font-semibold text-neutral-900 mb-2">
            {proposal.amount
              ? proposal.amount.toLocaleString("vi-VN") + " ₫"
              : "Không áp dụng"}
          </p>
          <p className="text-xs text-neutral-500 mt-2">
            Yêu cầu đa số: {proposal.requiredMajority * 100}%
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-neutral-500 mb-3">Thời gian bỏ phiếu</p>
          {(() => {
            const now = currentTime; // Use reactive currentTime instead of Date.now()
            const votingStarts = parseUTCDate(proposal.votingStartDate).getTime();
            const votingEnds = parseUTCDate(proposal.votingEndDate).getTime();
            
            if (now < votingStarts) {
              // Voting hasn't started yet
              return (
                <Box sx={{ p: 2, bgcolor: "#f5ebe0", borderRadius: 2, border: "1px solid #d4a574" }}>
                  <CountdownDisplay
                    targetDate={proposal.votingStartDate}
                    label="Bỏ phiếu bắt đầu sau"
                    variant="default"
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                    Kết thúc: {parseUTCDate(proposal.votingEndDate).toLocaleString("vi-VN")}
                  </Typography>
                </Box>
              );
            } else if (now >= votingStarts && now < votingEnds) {
              // Voting is active (use < instead of <= so when time reaches end, it shows as ended)
              return (
                <Box sx={{ p: 2, bgcolor: "#e8f5e9", borderRadius: 2, border: "1px solid #7a9b76" }}>
                  <CountdownDisplay
                    targetDate={proposal.votingEndDate}
                    label="Bỏ phiếu kết thúc sau"
                    variant="urgent"
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                    Đã bắt đầu: {parseUTCDate(proposal.votingStartDate).toLocaleString("vi-VN")}
                  </Typography>
                </Box>
              );
            } else {
              // Voting has ended
              return (
                <Box sx={{ p: 2, bgcolor: "#f0f0f0", borderRadius: 2, border: "1px solid #d0d0d0" }}>
                  <Typography variant="body1" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>
                    Bỏ phiếu đã kết thúc
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    Bắt đầu: {parseUTCDate(proposal.votingStartDate).toLocaleString("vi-VN")}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    Kết thúc: {parseUTCDate(proposal.votingEndDate).toLocaleString("vi-VN")}
                  </Typography>
                </Box>
              );
            }
          })()}
        </div>
      </section>

      <section className="card space-y-4">
        <h2 className="text-2xl font-semibold text-neutral-900">
          Tiến độ bỏ phiếu
        </h2>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="flex h-3 w-full overflow-hidden rounded-full">
            <span
              className="bg-accent-green"
              style={{ width: `${yesRatio}%` }}
            />
            <span
              className="bg-accent-terracotta"
              style={{ width: `${noRatio}%` }}
            />
            <span
              className="bg-neutral-300"
              style={{ width: `${Math.max(0, abstainRatio)}%` }}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-neutral-600">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent-green" /> Đồng ý{" "}
              {yesRatio}%
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent-terracotta" />{" "}
              Không đồng ý {noRatio}%
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-neutral-400" /> Trung lập{" "}
              {Math.max(0, abstainRatio)}%
            </span>
          </div>
        </div>
        {(() => {
          const now = currentTime; // Use reactive currentTime instead of Date.now()
          const votingStarts = parseUTCDate(proposal.votingStartDate).getTime();
          const votingEnds = parseUTCDate(proposal.votingEndDate).getTime();
          const isVotingActive = proposal.status === "Active" && now >= votingStarts && now < votingEnds;
          
          return isVotingActive ? (
            <div className="flex flex-wrap gap-3">
              <Button
                variant="contained"
                color="success"
                disabled={submitting}
                onClick={() => handleVote("Yes")}
              >
                Đồng ý
              </Button>
              <Button
                variant="contained"
                color="error"
                disabled={submitting}
                onClick={() => handleVote("No")}
              >
                Không đồng ý
              </Button>
              <Button
                variant="outlined"
                disabled={submitting}
                onClick={() => handleVote("Abstain")}
              >
                Trung lập
              </Button>
            </div>
          ) : (
            <Alert severity="info">
              {now < votingStarts 
                ? "Bỏ phiếu chưa bắt đầu. Vui lòng đợi đến thời gian bắt đầu bỏ phiếu."
                : "Đề xuất này đã đóng, bạn không thể bỏ phiếu nữa."}
            </Alert>
          );
        })()}
      </section>

      {results && (
        <section className="card space-y-3">
          <h2 className="text-2xl font-semibold text-neutral-900">
            Kết quả tổng hợp
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm">
              <p className="text-neutral-500">Quorum</p>
              <p className="text-2xl font-semibold text-neutral-900">
                {Math.round(Number(results.quorumPercentage) * 100)}%
              </p>
              <p className="text-neutral-500">
                {results.quorumMet ? "Đạt yêu cầu" : "Chưa đủ người tham gia"}
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm">
              <p className="text-neutral-500">Kết luận</p>
              <p className="text-2xl font-semibold text-neutral-900">
                {results.passed ? "Thông qua" : "Không thông qua"}
              </p>
              <p className="text-neutral-500">
                Cần {results.requiredMajority * 100}% đồng ý
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm">
              <p className="text-neutral-500">Trạng thái</p>
              <p className="text-2xl font-semibold text-neutral-900">
                {results.status}
              </p>
              <p className="text-neutral-500">
                {results.closedAt
                  ? `Đóng lúc ${new Date(results.closedAt).toLocaleString(
                      "vi-VN"
                    )}`
                  : "Đang mở"}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Related Documents Section */}
      {relatedDocuments.length > 0 && (
        <section className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-neutral-900">
              Tài liệu liên quan
            </h2>
            <Link
              to={`/groups/${groupId}/documents`}
              className="text-sm font-semibold text-accent-blue"
            >
              Xem tất cả →
            </Link>
          </div>
          {loadingDocuments ? (
            <div className="text-center py-4 text-neutral-500">
              Đang tải tài liệu...
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {relatedDocuments.map((doc) => (
                <Link
                  key={doc.id}
                  to={`/groups/${groupId}/documents/${doc.id}`}
                  className="rounded-2xl border border-neutral-200 bg-white p-4 hover:border-accent-blue hover:shadow-md transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-accent-blue/10 p-2 text-accent-blue">
                      <Description fontSize="small" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-neutral-900 truncate mb-1">
                        {doc.fileName}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        <Chip
                          label={getDocumentTypeName(doc.type)}
                          size="small"
                          sx={{
                            bgcolor: getDocumentTypeColor(doc.type),
                            color: "white",
                            fontSize: "0.65rem",
                            height: 20,
                            fontWeight: 600,
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <span>{formatFileSize(doc.fileSize)}</span>
                        <span>•</span>
                        <span>
                          {new Date(doc.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                      {doc.description && (
                        <p className="text-xs text-neutral-600 mt-1 line-clamp-2">
                          {doc.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="card space-y-4">
        <h2 className="text-2xl font-semibold text-neutral-900">
          Lịch sử bỏ phiếu
        </h2>
        <div className="space-y-3">
          {proposal.votes.map((vote) => (
            <div
              key={vote.id}
              className="rounded-2xl border border-neutral-200 bg-white p-4"
            >
              <div className="flex items-center justify-between text-sm">
                <p className="font-semibold text-neutral-900">
                  {vote.voterName}
                </p>
                <span className="text-neutral-500">
                  {new Date(vote.votedAt).toLocaleString("vi-VN")}
                </span>
              </div>
              <p className="text-sm text-neutral-600">
                Lựa chọn: {vote.choice}
              </p>
              {vote.comment && (
                <p className="text-xs text-neutral-500">"{vote.comment}"</p>
              )}
            </div>
          ))}
          {proposal.votes.length === 0 && (
            <p className="text-sm text-neutral-500">
              Chưa có thành viên nào bỏ phiếu.
            </p>
          )}
        </div>
      </section>

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

export default ProposalDetails;
