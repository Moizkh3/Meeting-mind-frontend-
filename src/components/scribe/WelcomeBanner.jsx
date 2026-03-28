import React from 'react';
import Button from '../common/Button';

const WelcomeBanner = ({ session }) => {
  if (!session) return null;

  return (
    <section className="bg-white border border-slate-200 rounded-sm p-6 md:px-8 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-6 md:gap-0">
      <div className="flex flex-col">
        {session.isLive && <span className="inline-block self-center md:self-start px-2 py-0.5 bg-red-50 text-red-600 text-[0.625rem] font-extrabold uppercase rounded-sm mb-2">Live Now</span>}
        <h3 className="text-[1.125rem] font-bold text-slate-800 mb-1">{session.title}</h3>
        <p className="text-sm text-slate-500">{session.company} • {session.time}</p>
      </div>
      <Button variant="primary" size="lg">Join Meeting Room</Button>
    </section>
  );
};

export default WelcomeBanner;
