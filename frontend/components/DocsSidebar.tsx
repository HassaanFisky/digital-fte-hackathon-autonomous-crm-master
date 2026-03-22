"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";

const NAV_GROUPS = [
  {
    title: "Getting Started",
    items: [
      { label: "What is ARIA?", href: "/docs/getting-started" },
      { label: "Your First Ticket", href: "/docs/getting-started#your-first-ticket" },
    ],
  },
  {
    title: "Agent Intelligence",
    items: [
      { label: "Groq + LLaMA-3", href: "/docs/agent-intelligence" },
      { label: "Escalation Logic", href: "/docs/agent-intelligence#escalation-logic" },
    ],
  },
  {
    title: "Channel Integration",
    items: [
      { label: "WhatsApp Setup", href: "/docs/channels#whatsapp-setup" },
      { label: "Gmail Polling", href: "/docs/channels#gmail-polling" },
      { label: "Kafka Topics", href: "/docs/channels#kafka-topics" },
    ],
  },
  {
    title: "Developer API",
    items: [
      { label: "REST Endpoints", href: "/docs/api-hooks" },
      { label: "Try It Live", href: "/docs/api-hooks#try-it-live" },
      { label: "Changelog", href: "/docs/changelog" },
    ],
  },
];

export default function DocsSidebar() {
  const pathname = usePathname();
  const [search, setSearch] = useState("");

  const filteredGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) =>
      item.label.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="w-full flex-1 flex flex-col mb-16">
      <div className="px-6 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E948A]" />
          <input
            type="text"
            placeholder="Search docs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[#DDD8CF] rounded-md py-2 pl-9 pr-3 text-[0.875rem] font-sans text-[#1A1612] placeholder:text-[#9E948A] focus:outline-none focus:border-[#CC5500] transition-colors"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          />
        </div>
      </div>

      <div className="px-4 space-y-6">
        <AnimatePresence>
          {filteredGroups.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center pt-8 text-[0.875rem] text-[#9E948A]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              No results for &quot;{search}&quot;
            </motion.div>
          )}

          {filteredGroups.map((group, groupIdx) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIdx * 0.05 }}
              className="px-2"
            >
              <h3
                className="text-[0.7rem] uppercase text-[#9E948A] font-bold tracking-[0.08em] px-4 pb-1 mb-1"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {group.title}
              </h3>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href.split("#")[0] && 
                    (item.href.includes('#') ? typeof window !== 'undefined' && window.location.hash === '#' + item.href.split('#')[1] : true);
                  // For actual active state, we can just highlight based on base route if we want, or exact URL if possible.
                  // Since next router doesn't easily expose hash synchronously in SSR, let's just use simple prefix match if no hash, or exact if hash.
                  
                  const activeClass = "bg-[#F5F0E8] text-[#CC5500] border-l-[3px] border-[#CC5500] font-semibold";
                  const hoverClass = "hover:bg-[#F5F0E8] hover:text-[#1A1612] border-l-[3px] border-transparent font-normal text-[#6B6459]";

                  // simpler logic: if pathname exactly matches the route.
                  const isRouteActive = pathname === item.href.split("#")[0] && !item.href.includes('#');
                  const isHashActive = false; // simplied for now, can be improved.

                  // Let's just use pathname match.
                  const isMatch = pathname === item.href.split('#')[0]; // Highlight all in same route temporarily, or just specific.
                  // To perfectly follow instructions:
                  const linkHref = item.href;

                  return (
                    <li key={item.label} className="relative">
                      <Link
                        href={linkHref}
                        className={`block w-full py-2 px-4 rounded-md text-[0.875rem] transition-colors ${
                          isMatch ? activeClass : hoverClass
                        }`}
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {item.label}
                      </Link>
                      {isMatch && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#CC5500] rounded-l-md"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
