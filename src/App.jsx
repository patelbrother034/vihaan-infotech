import React, { useState, useEffect } from "react";
import Sections from "./Sections.jsx";
import Chat from "./Chat.jsx";
import {
  ArrowUpRight,
  ArrowRight,
  Camera,
  Monitor,
  Network,
  Server,
  ShieldCheck,
  Layers,
  Check,
  Menu,
  X,
} from "lucide-react";

export const services = [
  {
    name: "CCTV & surveillance",
    value: "CCTV",
    icon: Camera,
    desc: "See what matters. Keep your premises protected with a well-planned surveillance system.",
    items: [
      "CCTV and IP camera installation",
      "DVR / NVR setup and storage",
      "Remote mobile monitoring",
      "Surveillance system maintenance",
    ],
  },
  {
    name: "Computer hardware",
    value: "Computer Hardware",
    icon: Monitor,
    desc: "Keep your everyday tools working, from desktops and laptops to the peripherals around them.",
    items: [
      "Desktop and laptop support",
      "Hardware installation and upgrades",
      "Troubleshooting and repairs",
      "Printer and peripheral setup",
    ],
  },
  {
    name: "Networking",
    value: "Networking",
    icon: Network,
    desc: "A connected workplace starts with a network that is designed around the way you work.",
    items: [
      "LAN / WAN and Wi-Fi setup",
      "Routers and managed switches",
      "Structured cabling",
      "Troubleshooting and expansion",
    ],
  },
  {
    name: "Server solutions",
    value: "Server",
    icon: Server,
    desc: "Build a dependable foundation for your files, applications, storage and business operations.",
    items: [
      "Installation and configuration",
      "File servers and storage",
      "Backup infrastructure",
      "Monitoring and maintenance",
    ],
  },
  {
    name: "AMC & maintenance",
    value: "AMC",
    icon: ShieldCheck,
    desc: "Stay ahead of recurring issues with regular checks and one partner for ongoing IT support.",
    items: [
      "Preventive system checks",
      "Hardware and network support",
      "CCTV and server maintenance",
      "Planned ongoing support",
    ],
  },
  {
    name: "IT infrastructure",
    value: "Complete IT Infrastructure",
    icon: Layers,
    desc: "Bring every part together. Plan and set up the technology your business needs to move forward.",
    items: [
      "Complete office IT setup",
      "Computer deployment",
      "Server room infrastructure",
      "Network and security systems",
    ],
  },
];
export function Logo() {
  return (
    <a className="logo" href="#home" aria-label="Vihaan Infotech home">
      <span className="logo-mark">
        V<span>·</span>
      </span>
      <span>
        VIHAAN<small>INFOTECH</small>
      </span>
    </a>
  );
}
export function Heading({ label, title, children }) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">{label}</p>
        <h2>{title}</h2>
      </div>
      {children && <p>{children}</p>}
    </div>
  );
}
export function Button({
  children,
  onClick,
  href = "#contact",
  secondary = false,
}) {
  return (
    <a
      className={"button " + (secondary ? "button-outline" : "")}
      href={href}
      onClick={onClick}
    >
      {children}
      <ArrowUpRight size={18} />
    </a>
  );
}
export default function App() {
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-enter");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.1 },
    );
    const elements = document.querySelectorAll(
      ".section-heading, .service-card, .amc-top, .amc-benefits article, .about-grid, .process-grid article",
    );
    elements.forEach((element) => observer.observe(element));
    const stop = () => {
      if (motion.matches) observer.disconnect();
    };
    motion.addEventListener("change", stop);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", stop);
    };
  }, []);
  const [menu, setMenu] = useState(false);
  const [selected, setSelected] = useState("");
  const choose = (value) => {
    setSelected(value);
    setMenu(false);
  };
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header>
        <div className="container header-inner">
          <Logo />
          <nav
            aria-label="Main navigation"
            className={menu ? "nav open" : "nav"}
          >
            {[
              ["Home", "home"],
              ["Services", "services"],
              ["Solutions", "solutions"],
              ["About us", "about"],
              ["AMC", "amc"],
            ].map(([label, id]) => (
              <a key={id} href={"#" + id} onClick={() => setMenu(false)}>
                {label}
              </a>
            ))}
          </nav>
          <a href="#contact" className="header-cta">
            Let’s talk <ArrowUpRight size={17} />
          </a>
          <button
            className="menu-toggle icon-button"
            onClick={() => setMenu(!menu)}
            aria-label={menu ? "Close navigation" : "Open navigation"}
            aria-expanded={menu}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main id="main">
        <section className="hero" id="home">
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">
                <span className="eyebrow-line" /> INFRASTRUCTURE. SECURITY.
                SUPPORT.
              </p>
              <h1>
                Your technology.
                <br />
                Connected.
                <br />
                <em>Protected.</em>
              </h1>
              <p className="hero-subtitle">
                Complete IT infrastructure & security solutions.
              </p>
              <p className="hero-description">
                From the camera at your door to the server at your core. CCTV,
                networking, hardware and ongoing support — all working together.
              </p>
              <div className="actions">
                <Button>Get a free consultation</Button>
                <a className="text-link" href="#services">
                  Explore services <ArrowRight size={18} />
                </a>
              </div>
              <div className="hero-footnote">
                <ShieldCheck size={18} />
                <span>
                  Built around your business. Supported for the long run.
                </span>
              </div>
            </div>
            <div className="hero-visual">
              <img
                src="/images/infrastructure.jpg"
                alt="Server racks and structured network cabling in a data centre"
              />
              <div className="visual-shade" />
              <div className="image-label">
                <span>01 / CONNECTED INFRASTRUCTURE</span>
                <ArrowUpRight size={22} />
              </div>
              <div className="visual-caption">
                <span className="tiny-label">
                  THE FOUNDATION FOR WHAT’S NEXT
                </span>
                <p>
                  Every connection.
                  <br />
                  Considered.
                </p>
              </div>
              <div className="visual-card">
                <span className="visual-icon">
                  <Network size={23} />
                </span>
                <div>
                  <strong>One connected ecosystem</strong>
                  <small>Security · Networks · Servers · Support</small>
                </div>
              </div>
            </div>
          </div>
        </section>
        <div className="value-strip">
          <div className="container">
            {[
              "Reliable IT support",
              "Professional installation",
              "Practical troubleshooting",
              "Complete AMC solutions",
            ].map((t) => (
              <span key={t}>
                <Check size={16} />
                {t}
              </span>
            ))}
          </div>
        </div>
        <section className="section services" id="services">
          <div className="container">
            <Heading
              label="01 / WHAT WE DO"
              title={
                <>
                  The right expertise.
                  <br />
                  Every part of your IT.
                </>
              }
            >
              A single point of support for the technology that keeps your
              workspace connected, secure and productive.
            </Heading>
            <div className="service-grid">
              {services.map((s, i) => (
                <article className="service-card" key={s.value}>
                  <div className="card-top">
                    <s.icon size={28} strokeWidth={1.6} />
                    <span>0{i + 1}</span>
                  </div>
                  <h3>{s.name}</h3>
                  <p>{s.desc}</p>
                  <details>
                    <summary>
                      Learn more <ArrowUpRight size={17} />
                    </summary>
                    <ul>
                      {s.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <a href="#contact" onClick={() => choose(s.value)}>
                      Discuss this service <ArrowRight size={16} />
                    </a>
                  </details>
                </article>
              ))}
            </div>
          </div>
        </section>
        <Sections
          selected={selected}
          setSelected={setSelected}
          choose={choose}
        />
      </main>
      <footer>
        <div className="container footer-main">
          <div>
            <Logo />
            <p>
              Complete IT infrastructure
              <br />
              &amp; security solutions.
            </p>
          </div>
          <div>
            <h3>Explore</h3>
            {[
              ["Home", "home"],
              ["Services", "services"],
              ["Solutions", "solutions"],
              ["About us", "about"],
              ["AMC", "amc"],
              ["Contact", "contact"],
            ].map(([t, id]) => (
              <a href={"#" + id} key={id}>
                {t}
              </a>
            ))}
          </div>
          <div>
            <h3>Services</h3>
            {services.map((s) => (
              <a key={s.value} href="#contact" onClick={() => choose(s.value)}>
                {s.name}
              </a>
            ))}
          </div>
          <div>
            <h3>Technology that works for you.</h3>
            <p>One conversation is a good place to start.</p>
            <a href="#contact">Let us talk ↗</a>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© 2026 Vihaan Infotech. All rights reserved.</span>
          <a href="#home">Back to top ↑</a>
        </div>
      </footer>
      <Chat />
    </>
  );
}
