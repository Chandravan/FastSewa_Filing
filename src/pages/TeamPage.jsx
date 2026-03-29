import { useEffect, useState } from "react";
import { Code2, Linkedin, Mail, Users } from "lucide-react";
import { Badge } from "@/components/ui";
import { cn, getInitials } from "@/lib/utils";

const visionaries = [
  {
    name: "Akhilesh Kumar",
    role: "Founder & CEO",
    image: "",
    email: "akjha12369@gmail.com",
    linkedin: "https://www.linkedin.com/in/akhilesh-kumar-8557a03a9/",
    summary: "Leads the overall vision and growth of FastSewa.",
    tone: "bg-orange-500/12 text-orange-300 border-orange-500/20",
  },
  {
    name: "Priyanka Jha",
    role: "Co-Founder & Head of Strategy",
    image: "",
    email: "pkjha1236@gmail.com",
    linkedin: "https://www.linkedin.com/in/priyanka-jha-5367a13a9/",
    summary: "Shapes planning, strategy, and long-term business direction.",
    tone: "bg-amber-500/12 text-amber-300 border-amber-500/20",
  },
  {
    name: "Varun Kr Jha",
    role: "COO",
    image: "",
    email: "kvarun5656@gmail.com",
    linkedin: "",
    summary:
      "Drives day-to-day execution and keeps operations running smoothly.",
    tone: "bg-sky-500/12 text-sky-300 border-sky-500/20",
  },
];

const developers = [
  {
    name: "Chandravan Kumar",
    role: "Full Stack Developer",
    image: "/images/chandravan.jpg",
    imageClassName: "h-full w-full object-cover object-top",
    linkedin: "https://www.linkedin.com/in/chandravan-kumar-86a143220/",
    summary: "Builds backend systems and product features across the stack.",
    tone: "bg-violet-500/12 text-violet-300 border-violet-500/20",
  },
  {
    name: "Anustha Rani",
    role: "Full Stack Developer",
    image: "/images/anustha.jpg",
    imageClassName: "h-full w-full object-cover object-top",
    linkedin: "https://www.linkedin.com/in/anustha-rani-5a40b9297/",
    summary: "Works on frontend experience and full stack product delivery.",
    tone: "bg-emerald-500/12 text-emerald-300 border-emerald-500/20",
  },
];

function SectionHeader({ icon: Icon, label, title, description }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <Badge
          variant="brand"
          className="inline-flex gap-2 px-3 py-1.5 text-[11px] uppercase tracking-[0.22em]"
        >
          <Icon size={14} />
          {label}
        </Badge>
        <h2 className="mt-4 text-3xl font-display font-bold text-white md:text-4xl">
          {title}
        </h2>
      </div>
      <p className="max-w-xl text-sm leading-relaxed text-white/45 md:text-base">
        {description}
      </p>
    </div>
  );
}

function SocialLink({ href, icon: Icon, label }) {
  if (!href) return null;
  const isMail = href.startsWith("mailto:");

  return (
    <a
      href={href}
      target={isMail ? undefined : "_blank"}
      rel={isMail ? undefined : "noreferrer"}
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-white/60 transition-colors hover:border-brand-500/40 hover:text-brand-300"
    >
      <Icon size={15} />
    </a>
  );
}

function AvatarPanel({
  src,
  name,
  tone,
  className,
  imageClassName,
  label = "Image space",
}) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  if (src && !imageFailed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center overflow-hidden border border-white/10 bg-black/20",
          className,
        )}
      >
        <img
          src={src}
          alt={name}
          className={cn("transition-transform duration-300", imageClassName)}
          onError={() => setImageFailed(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 border border-white/10 bg-white/[0.03] text-center",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-xl border font-display text-base font-bold",
          tone,
        )}
      >
        {getInitials(name)}
      </div>
      <div className="px-3">
        <p className="text-xs font-medium text-white/65">{label}</p>
        <p className="mt-1 text-[11px] text-white/30">Add photo later</p>
      </div>
    </div>
  );
}

function LeadershipCard({ member }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 transition-colors hover:border-white/20">
      <div className="flex items-start gap-4">
        <AvatarPanel
          src={member.image}
          name={member.name}
          tone={member.tone}
          className="h-28 w-28 shrink-0 rounded-2xl"
          imageClassName="max-h-full max-w-full object-contain p-1.5"
        />

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">
            {member.role}
          </p>
          <h3 className="mt-2 text-xl font-display font-bold text-white">
            {member.name}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-white/50">
            {member.summary}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <SocialLink
              href={`mailto:${member.email}`}
              icon={Mail}
              label={`Email ${member.name}`}
            />
            <SocialLink
              href={member.linkedin}
              icon={Linkedin}
              label={`LinkedIn ${member.name}`}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function DeveloperCard({ member }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] transition-colors hover:border-white/20">
      <div className="grid md:min-h-[320px] md:grid-cols-[220px_minmax(0,1fr)]">
        <AvatarPanel
          src={member.image}
          name={member.name}
          tone={member.tone}
          className="h-[420px] w-full rounded-none md:h-[320px] md:w-[220px]"
          imageClassName={member.imageClassName}
          label="Developer image"
        />

        <div className="flex h-full flex-col p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">
            {member.role}
          </p>
          <h3 className="mt-2 text-2xl font-display font-bold text-white">
            {member.name}
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-white/50">
            {member.summary}
          </p>

          <div className="mt-auto flex items-center justify-between gap-4 border-t border-white/10 pt-4">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/35">
              <Code2 size={14} />
              Product Engineering
            </span>
            <SocialLink
              href={member.linkedin}
              icon={Linkedin}
              label={`LinkedIn ${member.name}`}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-xs uppercase tracking-[0.22em] text-white/35">
        {label}
      </p>
      <p className="mt-3 text-3xl font-display font-bold text-white">{value}</p>
    </div>
  );
}

export default function TeamPage() {
  return (
    <div className="min-h-screen pt-24">
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-8 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <Badge
                variant="brand"
                className="px-3 py-1.5 text-[11px] uppercase tracking-[0.22em]"
              >
                Our Team
              </Badge>
              <h1 className="mt-5 text-4xl font-display font-bold text-white md:text-6xl">
                Built by a focused team.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/50 md:text-lg">
                FastSewa is shaped by a small leadership group and a lean
                engineering team. This page keeps image slots ready, so photos
                can be added later without changing the layout.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <StatCard label="Leadership" value="3" />
              <StatCard label="Developers" value="2" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            icon={Users}
            label="The Visionaries"
            title="Leadership"
            description="Three leaders guiding the product, strategy, and operations, each with a ready-made image slot."
          />

          <div className="grid gap-5 lg:grid-cols-3">
            {visionaries.map((member) => (
              <LeadershipCard key={member.name} member={member} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-20 pt-10">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            icon={Code2}
            label="The Developer Squad"
            title="Product Engineering"
            description="Two full stack developers building the platform with larger showcase cards and image-ready media space."
          />

          <div className="grid gap-6 md:grid-cols-2">
            {developers.map((member) => (
              <DeveloperCard key={member.name} member={member} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
