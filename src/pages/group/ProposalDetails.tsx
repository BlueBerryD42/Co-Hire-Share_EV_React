import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Alert, Button, Snackbar } from "@mui/material";
import type { UUID } from "@/models/booking";
import type {
  ProposalResultsDto,
  ProposalStatus,
  VoteChoice,
} from "@/models/proposal";
import { useProposal } from "@/hooks/useProposals";
import { proposalApi } from "@/services/group/proposals";

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
      await Promise.all([reload(), fetchResults()]);
    } catch (voteError) {
      setSnackbar({
        open: true,
        message:
          voteError instanceof Error ? voteError.message : "Không thể bỏ phiếu",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-4xl space-y-4 p-6">
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
    <section className="mx-auto max-w-5xl space-y-8 p-6">
      <header className="space-y-4">
        <p className="text-sm uppercase tracking-wide text-neutral-500">Screen 28 · Proposal Details</p>
        <Link to={`/groups/${groupId}/proposals`} className="text-sm font-semibold text-accent-blue">
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
          <p className="text-sm text-neutral-500">Loại</p>
          <p className="text-2xl font-semibold text-neutral-900">
            {proposal.type}
          </p>
          <p className="text-xs text-neutral-500">
            Người tạo: {proposal.creatorName} ·{" "}
            {new Date(proposal.createdAt).toLocaleDateString("vi-VN")}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-neutral-500">Số tiền</p>
          <p className="text-2xl font-semibold text-neutral-900">
            {proposal.amount
              ? proposal.amount.toLocaleString("vi-VN") + " ₫"
              : "Không áp dụng"}
          </p>
          <p className="text-xs text-neutral-500">
            Yêu cầu đa số: {proposal.requiredMajority * 100}%
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-neutral-500">Thời gian bỏ phiếu</p>
          <p className="text-2xl font-semibold text-neutral-900">
            Đến {new Date(proposal.votingEndDate).toLocaleString("vi-VN")}
          </p>
          <p className="text-xs text-neutral-500">
            Bắt đầu {new Date(proposal.votingStartDate).toLocaleString("vi-VN")}
          </p>
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
        {proposal.status === "Active" ? (
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
            Đề xuất này đã đóng, bạn không thể bỏ phiếu nữa.
          </Alert>
        )}
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
                {Math.round(results.quorumPercentage)}%
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
