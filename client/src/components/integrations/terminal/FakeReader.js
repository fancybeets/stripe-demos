import React from 'react';
import './FakeReader.css';
import { formatCurrency } from '../../../utils/formatCurrency';

const SCREEN_CONTENT = {
  none: {
    line1: 'NO READER',
    line2: 'CONNECTED',
    showAmount: false,
    active: false,
  },
  connecting: {
    line1: 'CONNECTING...',
    line2: null,
    showAmount: false,
    active: true,
  },
  idle: {
    line1: 'READER READY',
    line2: null,
    showAmount: false,
    active: false,
  },
  waiting_for_card: {
    line1: 'TAP INSERT',
    line2: 'OR SWIPE',
    showAmount: true,
    active: true,
  },
  card_detected: {
    line1: 'CARD DETECTED',
    line2: 'PROCESSING...',
    showAmount: true,
    active: true,
  },
  payment_authorized: {
    line1: 'AUTHORIZED',
    line2: 'READY TO CAPTURE',
    showAmount: true,
    active: false,
    authorized: true,
  },
  captured: {
    line1: 'PAYMENT',
    line2: 'APPROVED',
    showAmount: true,
    active: false,
    approved: true,
  },
  cancelled: {
    line1: 'TRANSACTION',
    line2: 'CANCELLED',
    showAmount: false,
    active: false,
  },
  error: {
    line1: 'ERROR',
    line2: null,
    showAmount: false,
    active: false,
  },
};

const FakeReader = ({ readerState, readerId, amount, currency }) => {
  const screen = SCREEN_CONTENT[readerState] || SCREEN_CONTENT.none;
  const shortId = readerId || null;

  return (
    <div className={`fake-reader ${screen.active ? 'fake-reader-active' : ''} ${screen.approved ? 'fake-reader-approved' : ''} ${screen.authorized ? 'fake-reader-authorized' : ''}`}>
      <div className="fake-reader-top">
        <div className="fake-reader-brand">STRIPE TERMINAL</div>
        {screen.active && <div className="fake-reader-pulse" />}
      </div>

      <div className="fake-reader-screen">
        <div className="fake-reader-merchant">DEMO STORE</div>
        <div className="fake-reader-divider" />
        <div className="fake-reader-status-line1">{screen.line1}</div>
        {screen.line2 && (
          <div className="fake-reader-status-line2">{screen.line2}</div>
        )}
        {screen.showAmount && amount && (
          <div className="fake-reader-amount">
            {formatCurrency(amount, currency || 'usd')}
          </div>
        )}
        {screen.approved && (
          <div className="fake-reader-checkmark">&#10003;</div>
        )}
      </div>

      <div className="fake-reader-bottom">
        <div className="fake-reader-led-row">
          <div className={`fake-reader-led ${readerState !== 'none' && readerState !== 'connecting' ? 'fake-reader-led-on' : ''}`} />
          <div className={`fake-reader-led ${readerState === 'waiting_for_card' || readerState === 'card_detected' ? 'fake-reader-led-on' : ''}`} />
          <div className={`fake-reader-led ${readerState === 'captured' ? 'fake-reader-led-on' : ''}`} />
        </div>
        {shortId && (
          <div className="fake-reader-id">{shortId}</div>
        )}
      </div>
    </div>
  );
};

export default FakeReader;
