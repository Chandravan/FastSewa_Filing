import { useEffect, useState } from "react";
import { Code2, Linkedin, Mail, Scale, Users } from "lucide-react";
import { Badge } from "@/components/ui";
import { BRAND_NAME } from "@/lib/support";
import { cn, getInitials } from "@/lib/utils";

const visionaries = [
  {
    name: "Varun Kr Jha",
    role: "Founder & CEO",
    image: "/images/varun.jpeg",
    imageClassName: "h-full w-full object-cover object-top",
    email: "kvarun5656@gmail.com",
    linkedin: "",
    summary:
      `Leads the overall vision, growth, and execution of ${BRAND_NAME}.`,
    tone: "bg-sky-500/12 text-sky-300 border-sky-500/20",
  },
];

const complianceSquad = [
  {
    name: "CA Harsh Ranjan",
    role: "Chartered Accountant",
    image: "/images/harsh-ranjan.jpeg",
    imageClassName: "h-full w-full object-cover object-top",
    email: "ca.ranjanharsh@gmail.com",
    linkedin:
      "https://www.linkedin.com/in/ca-harsh-ranjan-956737159?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    summary:
      "Supports finance, tax, and compliance work with professional CA oversight.",
    tone: "bg-cyan-500/12 text-cyan-300 border-cyan-500/20",
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
      {description && (
        <p className="max-w-xl text-sm leading-relaxed text-white/45 md:text-base">
          {description}
        </p>
      )}
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
      className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/60 transition-colors hover:border-brand-500/40 hover:text-brand-300"
    >
      <Icon size={17} />
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

function TeamMemberCard({
  member,
  footerIcon: Icon,
  footerLabel,
  footerTitle = footerLabel,
  imageLabel,
  className,
  imageClassName,
}) {
  return (
    <article className={cn("flex min-h-[320px] overflow-hidden rounded-[30px] border border-white/12 bg-[#151515] shadow-[0_24px_80px_rgba(0,0,0,0.25)] transition-colors hover:border-white/20", className)}>
      <div className="grid w-full md:grid-cols-[40%_60%]">
        <AvatarPanel
          src={member.image}
          name={member.name}
          tone={member.tone}
          className={cn("h-72 w-full rounded-none md:h-full md:min-h-[320px]", imageClassName)}
          imageClassName={member.imageClassName || "h-full w-full object-cover object-top"}
          label={imageLabel}
        />

        <div className="flex min-h-[320px] flex-col p-6 md:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.34em] text-orange-300">
            {member.role}
          </p>
          <h3 className="mt-5 text-2xl font-display font-bold leading-tight text-white md:text-3xl">
            {member.name}
          </h3>
          <p className="mt-5 max-w-sm text-base font-medium leading-relaxed text-white/48">
            {member.summary}
          </p>

          <div className="mt-auto flex items-center justify-between gap-4 border-t border-white/10 pt-5">
            <span className="inline-flex min-w-0 items-center gap-2 text-xs uppercase tracking-[0.26em] text-white/35">
              <Icon size={14} />
              <span className="truncate">{footerTitle}</span>
            </span>
            <div className="flex items-center gap-3">
              <SocialLink
                href={member.email ? `mailto:${member.email}` : ""}
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
      </div>
    </article>
  );
}

function TeamRowTitle({ icon: Icon, title }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-brand-300">
        <Icon size={16} />
      </span>
      <h3 className="text-xl font-display font-bold text-white">
        {title}
      </h3>
    </div>
  );
}

export default function TeamPage() {
  const teamGroups = [
    {
      icon: Users,
      label: "The Visionaries",
      title: "Leadership",
      imageLabel: "Leadership image",
      members: visionaries,
    },
    {
      icon: Scale,
      label: "⚖️ THE COMPLIANCE SQUAD",
      title: "Finance & Compliance",
      imageLabel: "Compliance image",
      members: complianceSquad,
    },
    {
      icon: Code2,
      label: "The Developer Squad",
      title: "Product Engineering",
      imageLabel: "Developer image",
      members: developers,
    },
  ];

  const teamMembers = teamGroups.flatMap((group) =>
    group.members.map((member) => ({
      ...member,
      group,
    })),
  );
  const founderMember = teamMembers.find((member) => member.role === "Founder & CEO");
  const complianceMembers = teamMembers.filter((member) => member.role === "Chartered Accountant");
  const developerMembers = teamMembers.filter((member) => member.role === "Full Stack Developer");

  return (
    <div className="min-h-screen pt-24">
      <section className="px-6 pb-10 pt-14">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.14),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.018))] p-6 md:grid-cols-[1fr_360px] md:p-8">
            <div>
              <Badge
                variant="brand"
                className="px-3 py-1.5 text-[11px] uppercase tracking-[0.22em]"
              >
                Our Team
              </Badge>
              <h1 className="mt-5 max-w-3xl text-4xl font-display font-bold leading-tight text-white md:text-5xl">
                Meet the people behind {BRAND_NAME}.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/50 md:text-lg">
                A compact team across leadership, finance, compliance, and
                engineering, working together to keep filing services simple and
                dependable.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 self-end">
              {[
                ["1", "Leader"],
                ["1", "Compliance"],
                ["2", "Developers"],
                ["4", "Total Team"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-4"
                >
                  <p className="text-2xl font-display font-bold text-white">
                    {value}
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-white/40">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-20 pt-4">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            icon={Users}
            label="Team Directory"
            title="One team, clear roles"
            description=""
          />

          <div className="space-y-6">
            {founderMember && (
              <div>
                <TeamRowTitle icon={Users} title="The Visionaries" />
                <div className="grid w-full max-w-3xl">
                  <TeamMemberCard
                    member={founderMember}
                    footerIcon={founderMember.group.icon}
                    footerLabel={founderMember.group.label}
                    footerTitle={founderMember.group.title}
                    imageLabel={founderMember.group.imageLabel}
                  />
                </div>
              </div>
            )}

            <div>
              <TeamRowTitle icon={Scale} title="The Compliance Squad" />
              <div className="grid w-full max-w-3xl">
                {complianceMembers.map((member) => (
                  <TeamMemberCard
                    key={member.name}
                    member={member}
                    footerIcon={member.group.icon}
                    footerLabel={member.group.label}
                    footerTitle={member.group.title}
                    imageLabel={member.group.imageLabel}
                  />
                ))}
              </div>
            </div>

            <div>
              <TeamRowTitle icon={Code2} title="The Developer Squad" />
              <div className="grid w-full max-w-7xl gap-5 xl:grid-cols-2">
                {developerMembers.map((member) => (
                  <TeamMemberCard
                    key={member.name}
                    member={member}
                    footerIcon={member.group.icon}
                    footerLabel={member.group.label}
                    footerTitle={member.group.title}
                    imageLabel={member.group.imageLabel}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
