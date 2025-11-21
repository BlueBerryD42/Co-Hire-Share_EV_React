import heroImage from "@/assets/react.svg";
import { useAppSelector } from "@/store/hooks";
import { useNavigate } from "react-router-dom";
import { VerifiedUser, Warning, Error as ErrorIcon } from "@mui/icons-material";

const Home = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  // Check if KYC verification is needed
  const needsKycVerification =
    isAuthenticated &&
    user &&
    (user.role === 2 || user.role === 3) &&
    (user.kycStatus ?? 0) !== 2;
  const kycStatus = user?.kycStatus ?? 0;

  const getKycCardContent = () => {
    switch (kycStatus) {
      case 0: // Pending
        return {
          title: "Hoàn tất xác thực KYC",
          description:
            "Xác thực danh tính của bạn để truy cập đầy đủ các tính năng và tham gia vào các nhóm chia sẻ xe.",
          icon: <Warning className="text-warning-600" />,
          buttonText: "Bắt đầu xác thực",
          buttonColor: "bg-neutral-700 hover:bg-neutral-800",
          showButton: true,
          onButtonClick: () => navigate("/kyc-verification"),
        };
      case 1: // InReview
        return {
          title: "KYC đang được xem xét",
          description:
            "Tài liệu của bạn đang được đội ngũ xem xét. Chúng tôi sẽ thông báo khi có kết quả.",
          icon: <VerifiedUser className="text-info-600" />,
          buttonText: "Xem trạng thái",
          buttonColor: "bg-neutral-600 hover:bg-neutral-700",
          showButton: false, // Don't show button for InReview status
          onButtonClick: () => {}, // No action
        };
      case 3: // Rejected
        return {
          title: "KYC cần cập nhật",
          description:
            "Tài liệu KYC của bạn đã bị từ chối. Vui lòng cập nhật và gửi lại để tiếp tục sử dụng dịch vụ.",
          icon: <ErrorIcon className="text-error-600" />,
          buttonText: "Cập nhật KYC",
          buttonColor: "bg-error-600 hover:bg-error-700",
          showButton: true,
          onButtonClick: () => navigate("/kyc-verification"),
        };
      default:
        return null;
    }
  };

  const kycCard = getKycCardContent();

  return (
    <div className="w-full">
      {/* KYC Verification Prompt */}
      {needsKycVerification && kycCard && (
        <section className="mx-auto max-w-6xl px-6 pt-6">
          <div className="rounded-xl border-2 border-neutral-200 bg-neutral-100 p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">{kycCard.icon}</div>
              <div className="flex-1">
                <h3 className="mb-2 text-lg font-semibold text-neutral-900">
                  {kycCard.title}
                </h3>
                <p className="mb-4 text-sm text-neutral-600">
                  {kycCard.description}
                </p>
                {kycCard.showButton !== false && kycCard.onButtonClick && (
                  <button
                    onClick={kycCard.onButtonClick}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${kycCard.buttonColor}`}
                  >
                    {kycCard.buttonText}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Overview Section */}
      <section
        id="overview"
        className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12 scroll-mt-20"
      >
        <div className="space-y-6">
          <p className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1 text-xs uppercase tracking-wide text-neutral-600">
            EV Fleet Sharing Platform
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
            Co-Hire Share EV Overview
          </h1>
          <p className="max-w-2xl text-lg text-neutral-600">
            Co-Hire Share EV is a comprehensive platform designed to
            revolutionize electric vehicle co-ownership. Our solution connects
            multiple stakeholders, enabling seamless sharing of electric
            vehicles through intelligent scheduling, transparent cost
            management, and community-driven collaboration.
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-neutral-200 bg-neutral-100 p-6">
              <h3 className="mb-2 text-lg font-semibold text-neutral-900">
                What We Do
              </h3>
              <p className="text-sm text-neutral-600">
                We facilitate electric vehicle co-ownership by providing tools
                for scheduling, billing, maintenance tracking, and group
                management.
              </p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-neutral-100 p-6">
              <h3 className="mb-2 text-lg font-semibold text-neutral-900">
                Who We Serve
              </h3>
              <p className="text-sm text-neutral-600">
                Families, communities, businesses, and organizations looking to
                share electric vehicles while reducing costs and environmental
                impact.
              </p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-neutral-100 p-6">
              <h3 className="mb-2 text-lg font-semibold text-neutral-900">
                Our Mission
              </h3>
              <p className="text-sm text-neutral-600">
                Making sustainable transportation accessible and affordable
                through innovative co-ownership solutions.
              </p>
            </div>
          </div>
        </div>

        {/* Platform Overview Visual */}
        <div className="rounded-2xl border border-neutral-200 bg-neutral-100 p-8">
          <div className="flex items-center justify-center rounded-xl bg-neutral-200 py-20">
            <img
              src={heroImage}
              alt="Platform overview"
              className="h-32 w-32 opacity-50"
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="bg-neutral-100 py-16 scroll-mt-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
              Benefits of Co-Ownership
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-neutral-600">
              Discover the advantages of sharing electric vehicles through our
              platform
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Benefit 1 */}
            <article className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8 shadow-sm">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-green-100">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-neutral-900">
                Significantly Lower Costs
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                Save up to 60% compared to traditional vehicle ownership by
                sharing purchase, insurance, maintenance, and charging expenses
                with your group members.
              </p>
            </article>

            {/* Benefit 2 */}
            <article className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8 shadow-sm">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100">
                <svg
                  className="h-8 w-8 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-neutral-900">
                Environmental Impact
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                Reduce your carbon footprint by maximizing vehicle utilization
                and promoting sustainable transportation practices within your
                community.
              </p>
            </article>

            {/* Benefit 3 */}
            <article className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8 shadow-sm">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-purple-100">
                <svg
                  className="h-8 w-8 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-neutral-900">
                Flexible Access
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                Enjoy convenient vehicle access when you need it without the
                burden of full ownership, perfect for occasional or variable
                transportation needs.
              </p>
            </article>

            {/* Benefit 4 */}
            <article className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8 shadow-sm">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-orange-100">
                <svg
                  className="h-8 w-8 text-orange-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-neutral-900">
                Community Building
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                Connect with like-minded individuals who share your values
                around sustainability and collaborative consumption.
              </p>
            </article>

            {/* Benefit 5 */}
            <article className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8 shadow-sm">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-red-100">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-neutral-900">
                Hassle-Free Maintenance
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                Share the responsibility of vehicle maintenance and service
                scheduling, making ownership easier and less stressful for
                everyone.
              </p>
            </article>

            {/* Benefit 6 */}
            <article className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8 shadow-sm">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-teal-100">
                <svg
                  className="h-8 w-8 text-teal-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-neutral-900">
                Transparent Cost Tracking
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                Monitor all expenses in real-time with automated billing and
                reporting, ensuring fair cost distribution and complete
                financial transparency.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 scroll-mt-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
              Transparent pricing
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-neutral-600">
              Choose the plan that fits your fleet size. Start with essentials,
              expand as you grow.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Starter Plan */}
            <article className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8 shadow-sm transition-all hover:shadow-md">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-neutral-900">
                  Starter
                </h3>
                <p className="mt-2 text-sm text-neutral-600">
                  Perfect for small groups
                </p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-neutral-900">$29</span>
                <span className="text-neutral-600">/month</span>
              </div>
              <ul className="mb-8 space-y-3">
                <li className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-neutral-700">
                    Up to 2 vehicles
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-neutral-700">
                    5 group members
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-neutral-700">
                    Basic scheduling
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-neutral-700">
                    Email support
                  </span>
                </li>
              </ul>
              <button className="w-full rounded-lg border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:border-accent-blue hover:text-accent-blue">
                Get Started
              </button>
            </article>

            {/* Professional Plan */}
            <article className="rounded-2xl border-2 border-accent-blue bg-neutral-50 p-8 shadow-lg">
              <div className="mb-4">
                <div className="mb-2 inline-block rounded-full bg-accent-blue px-3 py-1 text-xs font-semibold text-white">
                  POPULAR
                </div>
                <h3 className="text-xl font-semibold text-neutral-900">
                  Professional
                </h3>
                <p className="mt-2 text-sm text-neutral-600">
                  For growing fleets
                </p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-neutral-900">$79</span>
                <span className="text-neutral-600">/month</span>
              </div>
              <ul className="mb-8 space-y-3">
                <li className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-neutral-700">
                    Up to 10 vehicles
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-neutral-700">
                    Unlimited members
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-neutral-700">
                    Advanced analytics
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-neutral-700">
                    Priority support
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-neutral-700">API access</span>
                </li>
              </ul>
              <button className="w-full rounded-lg bg-accent-blue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-opacity-90">
                Get Started
              </button>
            </article>

            {/* Enterprise Plan */}
            <article className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8 shadow-sm transition-all hover:shadow-md">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-neutral-900">
                  Enterprise
                </h3>
                <p className="mt-2 text-sm text-neutral-600">
                  For large organizations
                </p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-neutral-900">
                  Custom
                </span>
              </div>
              <ul className="mb-8 space-y-3">
                <li className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-neutral-700">
                    Unlimited vehicles
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-neutral-700">
                    Unlimited members
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-neutral-700">
                    Custom integrations
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-neutral-700">
                    Dedicated support
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-neutral-700">
                    SLA guarantee
                  </span>
                </li>
              </ul>
              <button className="w-full rounded-lg border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:border-accent-blue hover:text-accent-blue">
                Contact Sales
              </button>
            </article>
          </div>

          {/* Additional Pricing Info */}
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-xs uppercase text-neutral-500">
            <span className="rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2">
              Usage-based billing
            </span>
            <span className="rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2">
              Shared maintenance
            </span>
            <span className="rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2">
              Dedicated support
            </span>
            <span className="rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2">
              No hidden fees
            </span>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-neutral-100 py-16 scroll-mt-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
              Get in Touch
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-neutral-600">
              Have questions? We're here to help. Reach out to our team and
              we'll get back to you as soon as possible.
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            {/* Primary Contact Card */}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8 shadow-sm mb-8">
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-blue/10">
                    <svg
                      className="h-8 w-8 text-accent-blue"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-neutral-900 mb-2">
                    Email Us
                  </h3>
                  <p className="text-neutral-600 mb-4">
                    Send us an email and our team will respond within 24 hours
                  </p>
                  <a
                    className="inline-flex items-center gap-2 rounded-lg bg-accent-blue px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-opacity-90"
                    href="mailto:contact@cohireshare.ev"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    contact@cohireshare.ev
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Methods Grid */}
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-center transition-shadow hover:shadow-md">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-blue-100">
                    <svg
                      className="h-7 w-7 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                      />
                    </svg>
                  </div>
                </div>
                <h4 className="mb-2 text-lg font-semibold text-neutral-900">
                  Live Chat
                </h4>
                <p className="text-sm text-neutral-600 mb-3">
                  Get instant answers from our support team
                </p>
                <p className="text-xs text-neutral-500 font-medium">
                  Available 24/7
                </p>
              </div>

              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-center transition-shadow hover:shadow-md">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-green-100">
                    <svg
                      className="h-7 w-7 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                </div>
                <h4 className="mb-2 text-lg font-semibold text-neutral-900">
                  Phone Support
                </h4>
                <p className="text-sm text-neutral-600 mb-3">
                  Talk to our experts directly
                </p>
                <p className="text-xs text-neutral-500 font-medium">
                  Mon-Fri 9AM-6PM EST
                </p>
              </div>

              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-center transition-shadow hover:shadow-md">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-purple-100">
                    <svg
                      className="h-7 w-7 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <h4 className="mb-2 text-lg font-semibold text-neutral-900">
                  Help Center
                </h4>
                <p className="text-sm text-neutral-600 mb-3">
                  Browse FAQs and documentation
                </p>
                <p className="text-xs text-neutral-500 font-medium">
                  Self-service resources
                </p>
              </div>
            </div>

            {/* Office Information */}
            <div className="mt-8 rounded-xl border border-neutral-200 bg-neutral-50 p-8 text-center">
              <h4 className="mb-4 text-lg font-semibold text-neutral-900">
                Our Office
              </h4>
              <p className="text-neutral-600">
                123 Electric Avenue, Suite 400
                <br />
                San Francisco, CA 94105
                <br />
                United States
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
