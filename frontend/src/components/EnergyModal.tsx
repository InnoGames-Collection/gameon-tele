/**
 * TelePlus Ethiopia - Clean Buy Coins Screen & Compact Confirmation Dialog
 * Midnight Navy & Deep Teal Theme
 */

import React, { useState } from 'react';
import { UserProfile } from '../types';
import { X, Coins as CoinsIcon, Check } from 'lucide-react';

export interface CoinPackage {
  id: string;
  coins: number;
  priceBirr: number;
}

export const COIN_PACKAGES: CoinPackage[] = [
  { id: 'pkg_5', coins: 5, priceBirr: 3 },
  { id: 'pkg_10', coins: 10, priceBirr: 5 },
  { id: 'pkg_25', coins: 25, priceBirr: 10 },
];

interface EnergyModalProps {
  profile?: UserProfile;
  onClose: () => void;
  onPurchasePackage: (coinsAmount: number, costETB: number) => Promise<{ success: boolean; message: string }>;
  onWatchAd?: () => void;
  onOpenVIP?: () => void;
  onOpenAuth?: () => void;
}

export const EnergyModal: React.FC<EnergyModalProps> = ({
  onClose,
  onPurchasePackage,
}) => {
  const [selectedPkg, setSelectedPkg] = useState<CoinPackage>(COIN_PACKAGES[0]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleOpenConfirm = (pkg: CoinPackage) => {
    setSelectedPkg(pkg);
    setShowConfirmDialog(true);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedPkg) return;
    setIsProcessing(true);
    try {
      await onPurchasePackage(selectedPkg.coins, selectedPkg.priceBirr);
      setShowConfirmDialog(false);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#071827]/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in select-none">
      <div 
        id="buy-coins-sheet"
        className="w-full max-w-sm bg-[#102C40] text-[#F5FAFC] rounded-t-2xl sm:rounded-2xl border border-[#244558] shadow-2xl p-5 relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#244558]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#15374A] border border-[#244558] text-[#F7C85B] flex items-center justify-center shadow-xs">
              <CoinsIcon className="w-4 h-4 fill-current" />
            </div>
            <h3 className="text-base font-black text-[#F5FAFC] uppercase tracking-wide">
              BUY COINS
            </h3>
          </div>

          <button
            id="close-buy-coins-btn"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#15374A] hover:bg-[#244558] text-[#A9C0CE] hover:text-[#F5FAFC] border border-[#244558] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* The 3 Clean Packages */}
        <div className="space-y-2.5 py-4">
          {COIN_PACKAGES.map((pkg) => {
            const isSelected = selectedPkg.id === pkg.id;
            return (
              <button
                key={pkg.id}
                id={`coin-pkg-${pkg.coins}`}
                onClick={() => setSelectedPkg(pkg)}
                className={`w-full p-3.5 rounded-xl border transition-all duration-150 flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-[#15374A] border-[#00BFA6] ring-2 ring-[#00BFA6]/30 shadow-xs'
                    : 'bg-[#0B2234] border-[#244558] hover:border-[#35D9F2]/50'
                }`}
              >
                {/* Left: Price */}
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${
                    isSelected ? 'bg-[#00BFA6] text-[#071827]' : 'bg-[#15374A] text-[#F5FAFC]'
                  }`}>
                    {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : <CoinsIcon className="w-4 h-4" />}
                  </div>
                  <span className="text-sm font-black text-[#F5FAFC] font-mono">
                    {pkg.priceBirr} Birr
                  </span>
                </div>

                {/* Right: Coins */}
                <div className="flex items-center gap-1.5 font-mono font-black text-sm text-[#F7C85B]">
                  <CoinsIcon className="w-4 h-4 text-[#F7C85B] fill-current" />
                  <span>{pkg.coins} Coins</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Primary Action Button */}
        <button
          id="proceed-buy-coins-btn"
          onClick={() => handleOpenConfirm(selectedPkg)}
          className="w-full py-3 rounded-xl bg-[#00BFA6] hover:bg-[#63F5C8] active:scale-95 text-[#071827] font-black text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <CoinsIcon className="w-4 h-4 fill-current" />
          <span>Buy {selectedPkg.coins} Coins ({selectedPkg.priceBirr} Birr)</span>
        </button>

        {/* =========================================================================
            COMPACT CONFIRMATION DIALOG
           ========================================================================= */}
        {showConfirmDialog && (
          <div className="fixed inset-0 z-60 bg-[#071827]/85 backdrop-blur-xs flex items-center justify-center p-4">
            <div 
              id="coin-purchase-confirm-dialog"
              className="w-full max-w-xs bg-[#102C40] rounded-2xl p-5 border border-[#244558] shadow-2xl text-center space-y-4 animate-in zoom-in-95"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#15374A] text-[#F7C85B] flex items-center justify-center mx-auto border border-[#244558]">
                <CoinsIcon className="w-6 h-6 text-[#F7C85B] fill-current" />
              </div>

              <div>
                <h4 className="text-base font-black text-[#F5FAFC] leading-tight">
                  Buy {selectedPkg.coins} Coins for {selectedPkg.priceBirr} Birr?
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  id="confirm-dialog-cancel-btn"
                  onClick={() => setShowConfirmDialog(false)}
                  disabled={isProcessing}
                  className="py-2.5 px-3 rounded-xl bg-[#15374A] hover:bg-[#244558] text-[#A9C0CE] hover:text-[#F5FAFC] border border-[#244558] font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  id="confirm-dialog-confirm-btn"
                  onClick={handleConfirmPurchase}
                  disabled={isProcessing}
                  className="py-2.5 px-3 rounded-xl bg-[#00BFA6] hover:bg-[#63F5C8] text-[#071827] font-black text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
