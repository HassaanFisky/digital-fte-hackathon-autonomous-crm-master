'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [formStep, setFormStep] = useState(1);
  const [ticketId, setTicketId] = useState('8847');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [stats, setStats] = useState({ tickets: 0, convos: 0, response: 0, escalation: 0 });

  const animateRef = useRef(false);

  // Stats for animation
  useEffect(() => {
    if (currentPage === 'dashboard' && !animateRef.current) {
      animateRef.current = true;
      let start = 0;
      const duration = 1000;
      const startTime = performance.now();

      const animate = (time: number) => {
        const progress = Math.min((time - startTime) / duration, 1);
        setStats({
          tickets: Math.floor(progress * 247),
          convos: Math.floor(progress * 14),
          response: Number((progress * 2.3).toFixed(1)),
          escalation: Number((progress * 4.9).toFixed(1))
        });
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    } else if (currentPage !== 'dashboard') {
      animateRef.current = false;
    }
  }, [currentPage]);

  const showPage = (page: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const nextStep = () => {
    if (formStep === 3) {
      setTicketId(Math.floor(8800 + Math.random() * 100).toString());
      setIsSubmitted(true);
    } else {
      setFormStep(prev => prev + 1);
    }
  };

  const prevStep = () => setFormStep(prev => prev - 1);

  const resetForm = () => {
    setIsSubmitted(false);
    setFormStep(1);
  };

  return (
    <main className="min-h-screen">
      {/* NAV */}
      <nav>
        <div className="container-custom flex justify-between items-center w-full">
          <div className="nav-logo cursor-pointer" onClick={() => showPage('landing')}>
            <div className="pulse-dot"></div>
            ARIA<span>FTE</span>
          </div>
          <div className="nav-links">
            <button className={`nav-btn ${currentPage === 'landing' ? 'active' : ''}`} onClick={() => showPage('landing')}>Home</button>
            <button className={`nav-btn ${currentPage === 'support' ? 'active' : ''}`} onClick={() => showPage('support')}>Submit Ticket</button>
            <button className={`nav-btn ${currentPage === 'dashboard' ? 'active' : ''}`} onClick={() => showPage('dashboard')}>Dashboard</button>
            <button className={`nav-btn ${currentPage === 'status' ? 'active' : ''}`} onClick={() => showPage('status')}>Ticket Status</button>
          </div>
          <button className="nav-cta hidden sm:block" onClick={() => showPage('support')}>Get Support →</button>
        </div>
      </nav>

      {/* CORNER WIDGET */}
      <div className="corner-widget">
        <div>
          <div className="cw-title">System Status</div>
          <div className="cw-val">● OPERATIONAL</div>
        </div>
        <div className="cw-sep"></div>
        <div>
          <div className="cw-title">Tickets Today</div>
          <div className="cw-val">247</div>
        </div>
        <div className="cw-sep"></div>
        <div>
          <div className="cw-title">Avg Response</div>
          <div className="cw-val">2.3s</div>
        </div>
      </div>

      {/* ─── LANDING PAGE ─── */}
      <div className={`page ${currentPage === 'landing' ? 'active' : ''}`}>
        <div style={{ background: 'radial-gradient(ellipse 80% 60% at 60% -10%, rgba(16,185,129,0.07) 0%, transparent 60%)' }}>
          <div className="container-custom">
            <div className="hero">
              <div>
                <div className="hero-badge">
                  <span className="pulse-dot" style={{ width: '6px', height: '6px' }}></span>
                  Live Production System
                </div>
                <h1>Your 24/7 <em>AI Customer</em> Success Employee</h1>
                <p>ARIA handles every support ticket across Email, WhatsApp, and Web — autonomously, instantly, flawlessly. Powered by Groq LLaMA 3.3 70B.</p>
                <div className="hero-btns">
                  <button className="btn-primary" onClick={() => showPage('support')}>Submit a Ticket →</button>
                  <button className="btn-ghost" onClick={() => showPage('dashboard')}>View Dashboard</button>
                </div>
              </div>
              <div className="hero-terminal">
                <div className="terminal-header">
                  <div className="term-dots">
                    <div className="term-dot td1"></div>
                    <div className="term-dot td2"></div>
                    <div className="term-dot td3"></div>
                  </div>
                  <div className="term-title">aria-agent · live</div>
                </div>
                <div className="terminal-body">
                  <div className="t-line"><span className="t-prompt">▶</span><span className="t-cmd">aria.process_ticket(channel="whatsapp")</span></div>
                  <div className="t-line"><span className="t-out">  [+] Customer identified: usr_a9f2c1</span></div>
                  <div className="t-line"><span className="t-out">  [+] History loaded: 3 prior interactions</span></div>
                  <div className="t-line"><span className="t-out">  [+] KB search: "password reset" → 1 match</span></div>
                  <div className="t-line"><span className="t-out success">  [✓] Ticket #TKT-8842 created</span></div>
                  <div className="t-line"><span className="t-out success">  [✓] Response sent via WhatsApp (1.8s)</span></div>
                  <div className="t-line"><span className="t-out">  [~] Sentiment score: 0.82 (positive)</span></div>
                  <div className="t-line"><span className="t-prompt">▶</span><span className="t-cmd">aria.metrics()</span></div>
                  <div className="t-line"><span className="t-out warn">  Uptime: 99.97% | Tickets today: 247</span></div>
                  <div className="t-line"><span className="t-out">  Escalations: 12 (4.9%) | Avg: 2.3s</span></div>
                  <div className="t-line"><span className="t-prompt">▶</span><span className="t-cursor"></span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container-custom">
          <div className="stats-row">
            <div className="stats-grid">
              <div className="stat-card"><div className="stat-num" style={{ color: 'var(--em)' }}>2.3s</div><div className="stat-lbl">Avg Response Time</div><div className="stat-sub">↓ 0.4s vs last week</div></div>
              <div className="stat-card"><div className="stat-num" style={{ color: 'var(--ind)' }}>99.9%</div><div className="stat-lbl">System Uptime</div><div className="stat-sub">30-day rolling avg</div></div>
              <div className="stat-card"><div className="stat-num" style={{ color: 'var(--amber)' }}>3</div><div className="stat-lbl">Active Channels</div><div className="stat-sub">Email · WhatsApp · Web</div></div>
              <div className="stat-card"><div className="stat-num" style={{ color: 'var(--em)' }}>24/7</div><div className="stat-lbl">Always On</div><div className="stat-sub">Zero downtime SLA</div></div>
            </div>
          </div>

          <div className="channel-strip-wrap">
            <div className="channel-strip">
              <div className="ch-item"><div className="ch-dot ch-em"></div><div><div className="ch-name">📧 Gmail</div><div className="ch-stat">47 tickets today</div></div></div>
              <div className="ch-sep"></div>
              <div className="ch-item"><div className="ch-dot ch-ind"></div><div><div className="ch-name">💬 WhatsApp</div><div className="ch-stat">128 tickets today</div></div></div>
              <div className="ch-sep"></div>
              <div className="ch-item"><div className="ch-dot ch-amb"></div><div><div className="ch-name">🌐 Web Form</div><div className="ch-stat">72 tickets today</div></div></div>
              <div className="ch-sep"></div>
              <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Kafka: Confluent · DB: Neon · AI: Groq</div>
            </div>
          </div>

          <div className="features">
            <div className="section-label">Capabilities</div>
            <div className="section-title">Built for Enterprise scale</div>
            <div className="feat-grid">
              <div className="feat-card">
                <div className="feat-icon fi-em">📧</div>
                <div className="feat-title">Email Intelligence</div>
                <div className="feat-desc">Monitors Gmail for unread priority messages, auto-replies with context-aware formal responses. Full thread awareness.</div>
                <div className="feat-badge fb-em">Gmail API</div>
              </div>
              <div className="feat-card">
                <div className="feat-icon fi-ind">💬</div>
                <div className="feat-title">WhatsApp Support</div>
                <div className="feat-desc">Twilio-powered WhatsApp webhook. Conversational, concise responses optimized for mobile. Auto-escalates.</div>
                <div className="feat-badge fb-ind">Twilio API</div>
              </div>
              <div className="feat-card">
                <div className="feat-icon fi-amb">🌐</div>
                <div className="feat-title">Web Form Intake</div>
                <div className="feat-desc">Pydantic validation. Instant ticket creation, real-time status tracking, and AI response within 5 minutes.</div>
                <div className="feat-badge fb-amb">FastAPI</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── SUPPORT FORM ─── */}
      <div className={`page ${currentPage === 'support' ? 'active' : ''}`}>
        <div className="form-page-container">
          <div className="form-header">
            <div className="hero-badge" style={{ margin: '0 auto 16px' }}>🌐 Web Form Channel</div>
            <h2>Submit a Support Request</h2>
            <p>ARIA will respond within 5 minutes, 24/7.</p>
          </div>

          {!isSubmitted ? (
            <>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${(formStep - 1) * 50}%` }}></div>
                <div className={`prog-step ${formStep >= 1 ? 'active' : ''} ${formStep > 1 ? 'done' : ''}`}><div className="prog-num">1</div><div className="prog-lbl">Contact</div></div>
                <div className={`prog-step ${formStep >= 2 ? 'active' : ''} ${formStep > 2 ? 'done' : ''}`}><div className="prog-num">2</div><div className="prog-lbl">Details</div></div>
                <div className={`prog-step ${formStep >= 3 ? 'active' : ''} ${formStep > 3 ? 'done' : ''}`}><div className="prog-num">3</div><div className="prog-lbl">Message</div></div>
              </div>

              <div className="form-card">
                {formStep === 1 && (
                  <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="field-group">
                      <label>Full Name</label>
                      <input className="form-input" type="text" placeholder="e.g. Hassaan Ahmed" />
                    </div>
                    <div className="field-group">
                      <label>Email Address</label>
                      <input className="form-input" type="email" placeholder="you@example.com" />
                    </div>
                    <div className="flex justify-end">
                      <button className="btn-next" onClick={nextStep}>Continue →</button>
                    </div>
                  </motion.div>
                )}
                {formStep === 2 && (
                  <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="field-group">
                      <label>Subject</label>
                      <input className="form-input" type="text" placeholder="Brief description of your issue" />
                    </div>
                    <div className="field-group">
                      <label>Category</label>
                      <select className="form-select">
                        <option>Technical</option>
                        <option>Billing</option>
                        <option>Bug Report</option>
                        <option>Feature Request</option>
                      </select>
                    </div>
                    <div className="flex justify-between">
                      <button className="btn-back" onClick={prevStep}>← Back</button>
                      <button className="btn-next" onClick={nextStep}>Continue →</button>
                    </div>
                  </motion.div>
                )}
                {formStep === 3 && (
                  <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="field-group">
                      <label>Describe Your Issue</label>
                      <textarea className="form-textarea" placeholder="Describe your issue in detail..."></textarea>
                    </div>
                    <div className="flex justify-between">
                      <button className="btn-back" onClick={prevStep}>← Back</button>
                      <button className="btn-next" onClick={nextStep}>Submit to ARIA →</button>
                    </div>
                  </motion.div>
                )}
              </div>
            </>
          ) : (
            <div className="form-card">
              <div className="success-card">
                <div className="success-icon">✅</div>
                <h3>Ticket Submitted!</h3>
                <p style={{ color: 'var(--text2)', marginBottom: '6px' }}>ARIA is processing your request.</p>
                <div className="ticket-display">
                  <div style={{ fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: '6px' }}>Your Ticket ID</div>
                  TKT-{ticketId}
                </div>
                <div className="flex gap-3 justify-center mt-8">
                  <button className="btn-primary" onClick={() => showPage('status')}>Track Status →</button>
                  <button className="btn-ghost" onClick={resetForm}>Submit Another</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── DASHBOARD PAGE ─── */}
      <div className={`page ${currentPage === 'dashboard' ? 'active' : ''}`}>
        <div className="tab-bar-wrap">
          <div className="container-custom">
            <div className="tab-bar">
              <div className="tab active">Overview</div>
              <div className="tab">Tickets</div>
              <div className="tab">Analytics</div>
              <div className="tab">CEO Briefing</div>
            </div>
          </div>
        </div>
        <div className="container-custom">
          <div className="dashboard-container">
            <div className="dash-header">
              <div>
                <div className="dash-title">ARIA Command Center</div>
                <div className="dash-sub">System operational · All channels active</div>
              </div>
              <div className="dash-actions">
                <button className="btn-sm-ghost">↓ Export CSV</button>
                <button className="btn-sm-em" onClick={() => showPage('support')}>+ New Ticket</button>
              </div>
            </div>

            <div className="kpi-row">
              <div className="kpi-card k-em">
                <div className="kpi-label">Tickets (24h)</div>
                <div className="kpi-val" style={{ color: 'var(--em)' }}>{stats.tickets}</div>
                <div className="stat-sub">↑ 18% vs yesterday</div>
              </div>
              <div className="kpi-card k-ind">
                <div className="kpi-label">Active Convos</div>
                <div className="kpi-val" style={{ color: 'var(--ind)' }}>{stats.convos}</div>
                <div className="stat-sub">Live monitoring</div>
              </div>
              <div className="kpi-card k-amb">
                <div className="kpi-label">Response Time</div>
                <div className="kpi-val" style={{ color: 'var(--amber)' }}>{stats.response}s</div>
                <div className="stat-sub">↓ 0.4s optimized</div>
              </div>
              <div className="kpi-card k-red">
                <div className="kpi-label">Escalation Rate</div>
                <div className="kpi-val" style={{ color: 'var(--red)' }}>{stats.escalation}%</div>
                <div className="stat-sub">↓ 1.2% threshold</div>
              </div>
            </div>

            <div className="mid-row">
              <div className="dash-card">
                <div className="dash-card-title">Channel Distribution</div>
                <div className="flex items-center gap-6">
                   <div className="w-24 h-24 rounded-full border-[10px] border-border relative flex items-center justify-center">
                     <div className="text-sm font-bold">247</div>
                   </div>
                   <div className="flex flex-col gap-2">
                     <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-ind"></div><span className="text-xs">WhatsApp: 128</span></div>
                     <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber"></div><span className="text-xs">Web Form: 72</span></div>
                     <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-em"></div><span className="text-xs">Email: 47</span></div>
                   </div>
                </div>
              </div>
              <div className="dash-card">
                <div className="dash-card-title">Sentiment Trend</div>
                <div className="chart-area flex items-end px-4 gap-2">
                   {[40, 60, 30, 80, 70, 90, 85].map((h, i) => (
                     <div key={i} className="flex-1 bg-em/20 rounded-t" style={{ height: `${h}%` }}></div>
                   ))}
                </div>
              </div>
            </div>

            <div className="dash-card">
              <div className="dash-card-title">Live Ticket Feed</div>
              <div className="table-wrap">
                <table className="ticket-table">
                  <thead>
                    <tr><th>ID</th><th>Customer</th><th>Channel</th><th>Status</th><th>Time</th></tr>
                  </thead>
                  <tbody>
                    <tr><td className="font-mono text-text3">TKT-8847</td><td className="font-bold">Hassaan Ahmed</td><td><span className="badge b-ind">WhatsApp</span></td><td><span className="badge b-amb">Processing</span></td><td className="text-text3">2m ago</td></tr>
                    <tr><td className="font-mono text-text3">TKT-8846</td><td className="font-bold">Amna Faraz</td><td><span className="badge b-em">Email</span></td><td><span className="badge b-red">Escalated</span></td><td className="text-text3">8m ago</td></tr>
                    <tr><td className="font-mono text-text3">TKT-8845</td><td className="font-bold">Usman Khan</td><td><span className="badge b-amb">Web</span></td><td><span className="badge b-em">Resolved</span></td><td className="text-text3">15m ago</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── TICKET STATUS PAGE ─── */}
      <div className={`page ${currentPage === 'status' ? 'active' : ''}`}>
        <div className="container-custom">
          <div className="status-page-container">
            <div className="status-header">
              <h2>Ticket Status</h2>
              <div className="flex items-center gap-4 flex-wrap mt-2">
                <span className="font-mono font-bold text-em text-lg">TKT-8847</span>
                <span className="badge b-amb">Processing</span>
                <span className="badge b-ind">WhatsApp</span>
              </div>
            </div>

            <div className="status-card">
              <div className="status-card-header">
                <div><div className="s-label">Subject</div><div className="s-val">Cannot reset my password — email link not working</div></div>
                <div className="flex gap-6">
                  <div><div className="s-label">Customer</div><div className="s-val">Hassaan Ahmed</div></div>
                  <div><div className="s-label">Sentiment</div><div className="s-val text-em">😊 0.82</div></div>
                </div>
              </div>

              <div className="conversation">
                <div className="msg customer">
                  <div className="msg-avatar av-customer">👤</div>
                  <div>
                    <div className="msg-bubble">Hey, I&apos;m trying to reset my password but the link in the email doesn&apos;t work. I&apos;ve tried 3 times already.</div>
                    <div className="text-[10px] text-text3 mt-1 text-right">16:40 · WhatsApp</div>
                  </div>
                </div>
                <div className="msg agent">
                  <div className="msg-avatar av-agent">🤖</div>
                  <div>
                    <div className="msg-bubble">I completely understand your frustration! Password links expire after 24 hours. Please request a fresh one from the login page.</div>
                    <div className="text-[10px] text-text3 mt-1">ARIA · 16:41 · 1.8s · WhatsApp</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-border bg-card/30 py-12 mt-20">
        <div className="container-custom flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <div className="flex items-center gap-2 font-head text-lg font-extrabold mb-1">
              ARIA<span className="text-em">FTE</span>
            </div>
            <p className="text-text3 text-[11px] font-medium tracking-wide">© 2026 HassaanFisky · All systems operational.</p>
          </div>
          <div className="flex gap-8 text-[13px] font-semibold text-text2">
            <a href="#" className="hover:text-em transition-all">Documentation</a>
            <a href="#" className="hover:text-em transition-all">Privacy</a>
            <a href="#" className="hover:text-em transition-all">API Status</a>
          </div>
        </div>
      </footer>

      {/* GLOBAL CSS INLINE OVERRIDES (for exact mapping) */}
      <style jsx global>{`
        .active { display: block !important; }
      `}</style>
    </main>
  );
}
