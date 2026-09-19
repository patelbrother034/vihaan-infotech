import React, { useState, useRef } from "react";
import {
  ArrowUpRight,
  Check,
  ShieldCheck,
  Clock3,
  HeartHandshake,
  Layers,
  Monitor,
  Camera,
  Network,
  Server,
  Wrench,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Building2,
  Store,
  Warehouse,
  GraduationCap,
  House,
  Briefcase,
  Building,
  CheckCircle2,
} from "lucide-react";
import { Button, Heading, services } from "./App.jsx";
const solutionData = [
  {
    title: "A clearer view. A safer space.",
    subtitle: "Complete CCTV & surveillance solutions",
    tag: "CCTV & SURVEILLANCE",
    value: "CCTV",
    image: "cctv.jpg",
    alt: "CCTV camera mounted on a building",
    text: "From shop floors to warehouse doors, we plan, install and maintain surveillance systems around the spaces you need to protect.",
    items: [
      "CCTV & IP camera installation",
      "DVR / NVR configuration",
      "Remote mobile monitoring",
      "Recording & storage",
      "System maintenance",
      "Offices, shops & homes",
    ],
    cta: "Discuss your CCTV requirement",
  },
  {
    title: "Good connections. Better work.",
    subtitle: "Reliable computer networking solutions",
    tag: "NETWORKING",
    value: "Networking",
    image: "networking.jpg",
    alt: "Structured network cables connected to a switch",
    text: "Keep teams, devices and business applications connected. We design, configure and maintain networks that fit your workplace.",
    items: [
      "LAN / WAN & Wi-Fi setup",
      "Router & switch configuration",
      "Structured cabling",
      "Network troubleshooting",
      "Connectivity optimization",
      "Network expansion",
    ],
    cta: "Plan your network",
  },
  {
    title: "A stronger core for your business.",
    subtitle: "Server setup & maintenance",
    tag: "SERVER SOLUTIONS",
    value: "Server",
    image: "infrastructure.jpg",
    alt: "Server infrastructure in a data centre",
    text: "Give your files and applications a dependable foundation, with considered server setup, storage, backups and ongoing support.",
    items: [
      "Server installation",
      "System configuration",
      "File & storage infrastructure",
      "Backup solutions",
      "Monitoring & troubleshooting",
      "Preventive maintenance",
    ],
    cta: "Get server support",
  },
];
export function Solutions({ choose }) {
  const [active, setActive] = useState(0);
  const s = solutionData[active];
  return (
    <section className="section solutions" id="solutions">
      <div className="container">
        <Heading
          label="02 / SOLUTIONS THAT FIT"
          title={
            <>
              Connected by design.
              <br />
              Supported by people.
            </>
          }
        >
          Practical solutions for the real spaces, systems and people that
          depend on your technology.
        </Heading>
        <div
          className="solution-tabs"
          role="tablist"
          aria-label="Explore IT solutions"
        >
          {solutionData.map((x, i) => (
            <button
              key={x.value}
              id={"solution-tab-" + i}
              role="tab"
              aria-selected={active === i}
              aria-controls="solution-panel"
              tabIndex={active === i ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(e) => {
                if (
                  ["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)
                ) {
                  e.preventDefault();
                  const next =
                    e.key === "Home"
                      ? 0
                      : e.key === "End"
                        ? 2
                        : (active + (e.key === "ArrowRight" ? 1 : 2)) % 3;
                  setActive(next);
                  document.getElementById("solution-tab-" + next).focus();
                }
              }}
            >
              <span>0{i + 1}</span>
              {x.tag}
              <ArrowUpRight size={17} />
            </button>
          ))}
        </div>
        <div
          className="solution-panel"
          id="solution-panel"
          role="tabpanel"
          aria-labelledby={"solution-tab-" + active}
        >
          <div className={"solution-image solution-image-" + active}>
            <img src={"/images/" + s.image} alt={s.alt} loading="lazy" />
            <span className="photo-caption">Designed around your space.</span>
          </div>
          <div className="solution-copy">
            <p className="eyebrow">{s.tag}</p>
            <h3>{s.title}</h3>
            <h4>{s.subtitle}</h4>
            <p>{s.text}</p>
            <ul className="checklist">
              {s.items.map((t) => (
                <li key={t}>
                  <Check size={15} />
                  {t}
                </li>
              ))}
            </ul>
            <Button onClick={() => choose(s.value)}>{s.cta}</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
function AMC({ choose }) {
  return (
    <section className="section amc" id="amc">
      <div className="container">
        <div className="amc-top">
          <div>
            <p className="eyebrow">03 / CARE THAT CONTINUES</p>
            <h2>
              Less disruption.
              <br />
              More <em>business as usual.</em>
            </h2>
          </div>
          <div>
            <p>
              Annual Maintenance Contracts designed to reduce downtime, prevent
              recurring problems and keep your IT infrastructure reliable.
            </p>
            <Button onClick={() => choose("AMC")}>
              Explore AMC for your business
            </Button>
          </div>
        </div>
        <div className="amc-benefits">
          {[
            [
              ShieldCheck,
              "Preventive maintenance",
              "Regular checks to catch issues before they become bigger problems.",
            ],
            [
              Wrench,
              "Faster issue resolution",
              "A clear point of contact for hardware, network and infrastructure issues.",
            ],
            [
              Clock3,
              "Reduced downtime",
              "Planned maintenance to keep business-critical systems running.",
            ],
            [
              HeartHandshake,
              "One support partner",
              "Bring multiple IT requirements together under one service arrangement.",
            ],
          ].map(([Icon, title, desc]) => (
            <article key={title}>
              <Icon size={26} />
              <h3>{title}</h3>
              <p>{desc}</p>
            </article>
          ))}
        </div>
        <div className="coverage">
          <span>WHAT WE LOOK AFTER</span>
          <p>
            Computers & laptops <b>·</b> Servers <b>·</b> Networks <b>·</b> CCTV{" "}
            <b>·</b> Printers & peripherals
          </p>
        </div>
      </div>
    </section>
  );
}
function About() {
  return (
    <>
      <section className="section" id="about">
        <div className="container about-grid">
          <div>
            <p className="eyebrow">04 / THE VIHAAN APPROACH</p>
            <h2>
              Technology is complex.
              <br />
              Your support
              <br />
              shouldn’t be.
            </h2>
            <p>
              Vihaan Infotech brings IT infrastructure, CCTV, networking,
              servers and computer hardware support together for businesses and
              homes.
            </p>
            <p>
              From setting up a new workspace to maintaining an existing one,
              our focus is simple: practical solutions, clear communication and
              support that continues after installation.
            </p>
            <a className="inline-link" href="#contact">
              Let’s discuss your requirement <ArrowUpRight size={18} />
            </a>
          </div>
          <div className="why-panel">
            <h3>Why businesses choose Vihaan Infotech</h3>
            {[
              [
                Monitor,
                "Technical support",
                "Hands-on help across hardware, networks and systems.",
              ],
              [
                Layers,
                "Complete IT solutions",
                "A coordinated approach to your whole infrastructure.",
              ],
              [
                HeartHandshake,
                "Reliable service",
                "Clear communication and an understanding of your needs.",
              ],
              [
                Clock3,
                "Responsive assistance",
                "Focused troubleshooting to help get work moving again.",
              ],
              [
                ShieldCheck,
                "Preventive care",
                "Regular maintenance that looks beyond the immediate issue.",
              ],
              [
                Wrench,
                "Practical value",
                "Solutions matched to your requirements and budget.",
              ],
            ].map(([Icon, title, desc]) => (
              <div className="why-row" key={title}>
                <Icon size={21} />
                <div>
                  <h4>{title}</h4>
                  <p>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="industries">
        <div className="container">
          <p className="eyebrow">SOLUTIONS FOR EVERY BUSINESS ENVIRONMENT</p>
          <div className="industry-list">
            {[
              [Building2, "Offices"],
              [Store, "Retail"],
              [Warehouse, "Warehouses"],
              [GraduationCap, "Education"],
              [House, "Homes"],
              [Briefcase, "Small businesses"],
              [Building, "Commercial buildings"],
            ].map(([Icon, label]) => (
              <div key={label}>
                <Icon size={23} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
function Process() {
  return (
    <section className="section process">
      <div className="container">
        <Heading
          label="05 / HOW WE WORK"
          title="A clear path from idea to installation."
        />
        <div className="process-grid">
          {[
            [
              "Understand",
              "We listen to your requirements and review the infrastructure you already have.",
            ],
            [
              "Plan",
              "We recommend a practical solution around your space, priorities and budget.",
            ],
            [
              "Install",
              "We install and configure the equipment, with attention to the details.",
            ],
            [
              "Support",
              "We help maintain your systems and provide ongoing technical assistance.",
            ],
          ].map(([title, desc], i) => (
            <article key={title}>
              <span>0{i + 1}</span>
              <h3>{title}</h3>
              <p>{desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
function Contact({ selected, setSelected }) {
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const formRef = useRef();
  function submit(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const err = {};
    if (!data.name.trim()) err.name = "Please enter your name.";
    if (
      !/^[+()\d\s-]{7,22}$/.test(data.phone.trim()) ||
      data.phone.replace(/\D/g, "").length < 7
    )
      err.phone = "Enter a valid phone number.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()))
      err.email = "Enter a valid email address.";
    if (!selected) err.service = "Choose a service.";
    if (data.message.trim().length < 10)
      err.message =
        "Please describe your requirement in at least 10 characters.";
    setErrors(err);
    setSuccess("");
    if (Object.keys(err).length) {
      formRef.current.elements[Object.keys(err)[0]].focus();
      return;
    }
    setSuccess(
      "Thank you, " +
        data.name.trim() +
        ". Your details passed validation. This is a demo: no request has been sent or saved.",
    );
    e.currentTarget.reset();
    setSelected("");
  }
  const field = (name, label, type = "text", optional = false) => (
    <div className="field">
      <label htmlFor={name}>
        {label}
        {optional ? (
          <span> (optional)</span>
        ) : (
          <span aria-hidden="true"> *</span>
        )}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        maxLength={name === "phone" ? 22 : 120}
        autoComplete={
          name === "name"
            ? "name"
            : name === "company"
              ? "organization"
              : name === "phone"
                ? "tel"
                : "email"
        }
        required={!optional}
        aria-invalid={!!errors[name]}
        aria-describedby={errors[name] ? name + "-error" : undefined}
        onChange={() => setSuccess("")}
      />
      {errors[name] && (
        <small className="field-error" id={name + "-error"}>
          {errors[name]}
        </small>
      )}
    </div>
  );
  return (
    <>
      <section className="cta-band">
        <div className="container">
          <div>
            <p className="eyebrow">LET’S MAKE YOUR IT WORK BETTER</p>
            <h2>Need reliable IT support?</h2>
            <p>
              CCTV, office networking, server support or ongoing maintenance.
              <br />
              Let’s find the right next step for your business.
            </p>
          </div>
          <Button href="#contact">Request a consultation</Button>
        </div>
      </section>
      <section className="section contact" id="contact">
        <div className="container contact-grid">
          <div>
            <p className="eyebrow">06 / START A CONVERSATION</p>
            <h2>
              Let’s discuss
              <br />
              your IT requirement.
            </h2>
            <p>
              Tell us what you’re planning or what needs fixing. Start with a
              few details about your space and the support you need.
            </p>
            <div className="contact-details">
              {[
                [Phone, "Mayur Panchal (IT Professional)", "8160747279", "tel:+918160747279"],
                [Mail, "Email", "vihaaninfotech0987@gmail.com", "mailto:vihaaninfotech0987@gmail.com"],
                [MapPin, "Address", "FF-106 Pratishtha hills, Opp. Shyam Kutir - 56 Bunglows, Naroda-Dehegam Road, Ahmedabad-382330"],
                [Instagram, "Instagram", "@vihaaninfotech_2023", "https://www.instagram.com/vihaaninfotech_2023/"],
              ].map(([Icon, label, text, href]) => (
                <div key={label}>
                  <Icon size={20} />
                  <div>
                    <strong>{label}</strong>
                    {href ? <a href={href}>{text}</a> : <span>{text}</span>}
                  </div>
                </div>
              ))}
            </div>
            <div className="demo-note">
              <ShieldCheck size={19} />
              <p>
                <strong>Local preview</strong>This form is a demonstration. Your
                details stay in this browser and are not sent or saved.
              </p>
            </div>
          </div>
          <form
            noValidate
            ref={formRef}
            onSubmit={submit}
            className="contact-form"
          >
            <h3>Your next step starts here.</h3>
            <p className="form-intro">Fields marked * are required.</p>
            <div className="form-grid">
              {field("name", "Your name")}
              {field("company", "Company", "text", true)}
              {field("phone", "Phone number", "tel")}
              {field("email", "Email address", "email")}
              <div className="field full">
                <label htmlFor="service">Service required *</label>
                <select
                  id="service"
                  name="service"
                  required
                  value={selected}
                  aria-invalid={!!errors.service}
                  aria-describedby={
                    errors.service ? "service-error" : undefined
                  }
                  onChange={(e) => {
                    setSelected(e.target.value);
                    setSuccess("");
                  }}
                >
                  <option value="">Select a service</option>
                  {[...services.map((s) => s.value), "Other"].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
                {errors.service && (
                  <small className="field-error" id="service-error">
                    {errors.service}
                  </small>
                )}
              </div>
              <div className="field full">
                <label htmlFor="message">
                  Tell us about your requirement *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  maxLength={3000}
                  required
                  placeholder="Your space, your systems, and what you need help with…"
                  aria-invalid={!!errors.message}
                  aria-describedby={
                    errors.message ? "message-error" : undefined
                  }
                  onChange={() => setSuccess("")}
                />
                {errors.message && (
                  <small className="field-error" id="message-error">
                    {errors.message}
                  </small>
                )}
              </div>
            </div>
            <button className="button form-submit" type="submit">
              Check demo request <ArrowUpRight size={18} />
            </button>
            {success && (
              <div className="form-success" role="status">
                <CheckCircle2 size={20} />
                <p>{success}</p>
              </div>
            )}
          </form>
        </div>
      </section>
    </>
  );
}
export default function Sections({ selected, setSelected, choose }) {
  return (
    <>
      <Solutions choose={choose} />
      <AMC choose={choose} />
      <About />
      <Process />
      <Contact selected={selected} setSelected={setSelected} />
    </>
  );
}
