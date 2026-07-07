import { SiteNav } from "@/components/storefront/SiteNav";
import { Shop } from "@/components/storefront/Shop";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { Toast } from "@/components/storefront/Toast";
import { Faq } from "@/components/storefront/Faq";
import { getStorefront, getStoreSettings } from "@/lib/queries";
import { getWhatsAppLink } from "@/lib/format";
import { Logo } from "@/components/Logo";
import { Star, Zap, ShieldCheck, CreditCard, MessageCircle, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { categories, products } = await getStorefront();
  const settings = await getStoreSettings();
  const serviceCount = products.length;

  return (
    <>
      {/* Announcement */}
      <div className="topbar">
        <div className="wrap">
          <span>
            ⚡ <b>Instant delivery</b> — most orders within 5 minutes
          </span>
          <span className="dot" />
          <span>
            Pay with <b>bKash · Nagad · Rocket</b>
          </span>
          <span className="dot" />
          <span>
            🛡️ <b>Replacement warranty</b> on every plan
          </span>
        </div>
      </div>

      {!settings.isOpen && (
        <div style={{ background: "rgba(239, 68, 68, 0.15)", borderBottom: "1px solid rgba(239, 68, 68, 0.25)", padding: "10px 0", color: "#f87171", fontSize: "14px", fontWeight: 500, textAlign: "center" }}>
          <div className="wrap">
            🛑 <b>Store Temporarily Closed</b> — We are currently not accepting new orders. WhatsApp ordering is disabled.
          </div>
        </div>
      )}

      <SiteNav storeName={settings.storeName} logoUrl={settings.logoUrl} />

      {/* Hero */}
      <section className="hero">
        <div className="wrap">
          <div>
            <span className="eyebrow">
              <span className="pulse" />
              Trusted by 12,000+ customers in Bangladesh
            </span>
            <h1>
              Premium subscriptions, <em>half the price.</em>
            </h1>
            <p className="sub">
              Netflix, ChatGPT Plus, Spotify, Canva &amp; {serviceCount}+ more —
              ordered via WhatsApp in minutes. Genuine plans, local payment,
              real support.
            </p>
            <div className="hero-cta">
              <a href="#shop" className="btn btn-lime" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                Browse subscriptions <ArrowRight size={16} />
              </a>
              <a
                href="#how"
                className="btn btn-ghost"
                style={{ borderColor: "rgba(255,255,255,.3)", color: "#fff" }}
              >
                How it works
              </a>
            </div>
            <div className="hero-stats">
              <div className="s">
                <b>{serviceCount}+</b>
                <span>Services</span>
              </div>
              <div className="s">
                <b>
                  <span className="accent">5</span> min
                </b>
                <span>Avg. delivery</span>
              </div>
              <div className="s">
                <b style={{ display: "inline-flex", alignItems: "center", gap: "4px", justifyContent: "center" }}>
                  4.9 <Star size={16} fill="currentColor" stroke="none" style={{ color: "#fbbf24" }} />
                </b>
                <span>2,300 reviews</span>
              </div>
            </div>
          </div>
          <div className="cluster">
            <div className="tile t1">
              <div className="brow">
                <span className="logo-chip" style={{ color: "#E50914" }}>
                  NETFLIX
                </span>
                <span className="ok">✓ live</span>
              </div>
              <div className="pname">Premium · 4K UHD</div>
              <div className="pprice">
                ৳380 <span>/mo</span>
              </div>
            </div>
            <div className="tile t2">
              <div className="brow">
                <span className="logo-chip" style={{ color: "#10A37F" }}>
                  ChatGPT
                </span>
                <span className="ok">✓ live</span>
              </div>
              <div className="pname">Plus · GPT-4o</div>
              <div className="pprice">
                ৳299 <span>/mo</span>
              </div>
            </div>
            <div className="tile t3">
              <div className="brow">
                <span className="logo-chip" style={{ color: "#1DB954" }}>
                  Spotify
                </span>
                <span className="ok">✓ live</span>
              </div>
              <div className="pname">Premium Individual</div>
              <div className="pprice">
                ৳179 <span>/mo</span>
              </div>
            </div>
            <div className="tile t4">
              <div className="brow">
                <span className="logo-chip" style={{ color: "#7D2AE8" }}>
                  Canva
                </span>
                <span className="ok">✓ live</span>
              </div>
              <div className="pname">Pro · Edu</div>
              <div className="pprice">
                ৳199 <span>/mo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <div className="trust">
        <div className="wrap">
          <div className="item">
            <div className="ic" style={{ color: "var(--lime-deep)" }}>
              <Zap size={20} fill="currentColor" />
            </div>
            <div>
              <b>Instant delivery</b>
              <span>Auto-sent in minutes</span>
            </div>
          </div>
          <div className="item">
            <div className="ic" style={{ color: "var(--lime-deep)" }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <b>Warranty included</b>
              <span>Free replacement</span>
            </div>
          </div>
          <div className="item">
            <div className="ic" style={{ color: "var(--lime-deep)" }}>
              <CreditCard size={20} />
            </div>
            <div>
              <b>Local payment</b>
              <span>bKash · Nagad · Rocket</span>
            </div>
          </div>
          <div className="item">
            <div className="ic" style={{ color: "var(--lime-deep)" }}>
              <MessageCircle size={20} />
            </div>
            <div>
              <b>24/7 support</b>
              <span>WhatsApp &amp; live chat</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shop — dynamic from DB */}
      <Shop categories={categories} products={products} isOpen={settings.isOpen} whatsApp={settings.whatsApp} />

      {/* How it works */}
      <div id="how" className="how">
        <div className="inner">
          <div className="sec-head" style={{ marginBottom: 0 }}>
            <div>
              <div className="kicker">Dead simple</div>
              <h2 style={{ color: "#fff" }}>Get set up in 3 steps</h2>
            </div>
          </div>
          <div className="steps">
            <div className="step">
              <div className="num">1</div>
              <h4>Choose subscription</h4>
              <p>
                Browse all services, pick the duration that fits.
              </p>
            </div>
            <div className="step">
              <div className="num">2</div>
              <h4>Order on WhatsApp</h4>
              <p>
                Click &quot;Order on WhatsApp&quot; to connect with us instantly.
              </p>
            </div>
            <div className="step">
              <div className="num">3</div>
              <h4>Pay &amp; get access</h4>
              <p>
                Pay via bKash, Nagad, or Rocket. Credentials or activation arrive on WhatsApp within minutes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bundle */}
      <section id="bundle" className="block">
        <div className="wrap">
          <div className="bundle">
            <div>
              <span
                className="eyebrow"
                style={{
                  background: "rgba(198,255,61,.1)",
                  borderColor: "rgba(198,255,61,.25)",
                  color: "var(--lime)",
                  marginBottom: 16,
                }}
              >
                🔥 Best value
              </span>
              <h2>
                The <span className="accent">Creator Bundle</span>
              </h2>
              <p>
                ChatGPT Plus + Canva Pro + Spotify Premium in one pack.
                Everything a student or creator needs — one payment, one
                delivery.
              </p>
            </div>
            <div className="pricebox">
              <div className="lab">All 3, per month</div>
              <div className="big">৳599</div>
              <div
                className="lab"
                style={{
                  textDecoration: "line-through",
                  color: "#6a6b75",
                  margin: "0 0 16px",
                }}
              >
                ৳877
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <div>
              <div className="kicker">Loved locally</div>
              <h2>What customers say</h2>
            </div>
          </div>
          <div className="reviews">
            <div className="review">
              <div className="st" style={{ display: "flex", gap: "2px", marginBottom: "8px", color: "#fbbf24" }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" stroke="none" />
                ))}
              </div>
              <p>
                &quot;Ordered ChatGPT Plus at 11pm, got the login in 4 minutes
                over WhatsApp. Cheaper than paying in dollars and it just
                works.&quot;
              </p>
              <div className="who">
                <div className="av">TR</div>
                <div>
                  <b>Tanvir Rahman</b>
                  <span>Dhaka · Verified buyer</span>
                </div>
              </div>
            </div>
            <div className="review">
              <div className="st" style={{ display: "flex", gap: "2px", marginBottom: "8px", color: "#fbbf24" }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" stroke="none" />
                ))}
              </div>
              <p>
                &quot;Netflix 4K for the whole family at a fraction of the price.
                Had one issue and they replaced it same day. Proper
                support.&quot;
              </p>
              <div className="who">
                <div className="av">SA</div>
                <div>
                  <b>Sadia Akter</b>
                  <span>Chittagong · Verified buyer</span>
                </div>
              </div>
            </div>
            <div className="review">
              <div className="st" style={{ display: "flex", gap: "2px", marginBottom: "8px", color: "#fbbf24" }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" stroke="none" />
                ))}
              </div>
              <p>
                &quot;bKash payment, instant delivery, no drama. I&apos;ve bought
                Spotify and Canva from here — my go-to now.&quot;
              </p>
              <div className="who">
                <div className="av">MH</div>
                <div>
                  <b>Mahin Hossain</b>
                  <span>Sylhet · Verified buyer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div
            className="sec-head"
            style={{
              justifyContent: "center",
              textAlign: "center",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div>
              <div className="kicker">Questions</div>
              <h2>Good to know</h2>
            </div>
          </div>
          <Faq />
        </div>
      </section>

      {/* Footer */}
      <footer className="site">
        <div className="wrap">
          <div className="fcols">
            <div>
              <a className="logo" href="#">
                <Logo storeName={settings.storeName} logoUrl={settings.logoUrl} />
              </a>
              <p className="blurb">
                Bangladesh&apos;s trusted store for premium digital
                subscriptions. Genuine plans, instant delivery, local payment.
              </p>
              <div className="pays">
                <span className="pay">bKash</span>
                <span className="pay">Nagad</span>
                <span className="pay">Rocket</span>
                <span className="pay">Upay</span>
                <span className="pay">Visa</span>
              </div>
            </div>
            <div>
              <h5>Shop</h5>
              {categories.map((c) => (
                <a key={c.id} href="#shop">
                  {c.name}
                </a>
              ))}
            </div>
            <div>
              <h5>Company</h5>
              <a href="#how">How it works</a>
              <a href="#reviews">Reviews</a>
              <a href={`mailto:${settings.contactEmail}`}>Contact Us</a>
            </div>
            <div>
              <h5>Support</h5>
              <a href="#faq">FAQ</a>
              <a href={getWhatsAppLink(settings.whatsApp, "Hi, I need support with my subscription.")} target="_blank" rel="noopener noreferrer">WhatsApp Support</a>
              <a href="/admin">Admin</a>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 {settings.storeName}. All rights reserved.</span>
            <span>Made for Bangladesh 🇧🇩 · {settings.whatsApp}</span>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      {settings.isOpen ? (
        <a
          className="wa"
          href={getWhatsAppLink(settings.whatsApp, "Hi! I'd like to order a subscription.")}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
        >
          <MessageCircle size={18} /> Order on WhatsApp
        </a>
      ) : (
        <a
          className="wa"
          href="#"
          onClick={(e) => e.preventDefault()}
          style={{ opacity: 0.6, cursor: "not-allowed", background: "#4b5563", display: "inline-flex", alignItems: "center", gap: "8px" }}
        >
          <MessageCircle size={18} /> Store Closed
        </a>
      )}

      <CartDrawer isOpenStore={settings.isOpen} />
      <Toast />
    </>
  );
}
