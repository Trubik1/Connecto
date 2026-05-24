import { QRCodeSVG } from 'qrcode.react';

export default function QRCodeDisplay({ value }: { value: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <QRCodeSVG value={value} size={220} includeMargin />
      <p className="text-sm text-gray-500 break-all text-center">{value}</p>
    </div>
  );
}
