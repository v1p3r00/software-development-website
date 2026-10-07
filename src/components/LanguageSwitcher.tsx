import { useI18n } from '../i18n';
import type { Lang } from '../data/projects';
import { cx } from './ui';

/**
 * Union Jack, as a small bitmap: drawn as SVG its counterchanged diagonals need
 * clip paths, and the first clip path on a page holds up the first paint by
 * ~0.4 s on CPU-rendered (no-GPU) browsers.
 */
const UNION_JACK = 'data:image/webp;base64,UklGRuwIAABXRUJQVlA4IOAIAADQLQCdASpjAEIAPjESiEKiISEWat9sIAMEtgBmhLi/APxu7I6HXP/xm/cD/VfLbWf5r95P3a/0eXNcu/8b9Tv937SP+N/a/cZ+X/9H7gH6Gf2L+gfud/Ve5z+M3sA/if9G/4H+q/f/5j/9r/jvZj/zPUd/1HUieib5Z3spftx/0P8p7Mn/N1l7w7/IPw38Hv6v+Lf7M9UF7AZxn7E/WPyK/k3tR/UPyM8wdpL+R/jH+5n9f5ICo/oBejXyH+nflf/dvRG/jPwzymWFV9oH0i/tX/G+432g/kn9X/4H9r+Ab+RfzL/Kf2v90P8j//+Ua/Z7//hHwfl2Ke73zjpEOE/PHqYmLambkw1XoqEV7/8/halt31GPaRcHaeHOMLYd0T8u/kjAJcPenLehabQMWOB1ZWRPUIjfnvEeBIFk9Hcw3Eo+vOFIvH+C30hwmnRswzOv/7wCUtgX/v+krhXPIqfUF+Op1C+rQ1TJUk0T0eUbtsm88EMCjoAA9FCmv9cxhtR1Mu4PIiPNAOIm89x9U75UKm26ScP0sqZFCaxU9yjXhnkVxem7KTHBgnapt7nEbDkCVa6zXN5isO0xqrmMu2QJTMspFUl7AfnHUbIDlEMV9hKuAf1l0AZ4fJ7zT4kHITjRbyFL6ILr4PU692O9ntSgI8IbBF7ZydmvdttktI1ZUZLdAwhZPjiwQuQkE4Oxj3ogRDdAGhwHs+OfhrV/vxg9h366zab1hqZDO3+PAJV/8loF5OTtv/BpgcK1/ql/4NWfOpGFn52dXt8k+fWorle3yj/w8Uubcxnx3dN00D2Vu0xHeBDwc5iO8CUjcSIyMhFDJRYTHmJSPbz6gawEeMVE0wRUTtR5WKtuTzGbrhKZjw6uuhO76lMADlKW+JqvyQs924Xzyo2l4baFe8FwNCi8vhZFzvR2GJ95eI5b5x6ifjIiV90f4TP1sv44sw0Pi3C4O5AhBD+lHaRaiqS0dtH3QAR/4JCU+WygOM5ZrIApF6vR4x6MI/jUmykRQn4gUgvSHyVhcQaFCj380iBXSEM747agWHjfuO0U6dC67URuMEwzQUo0YkNup//MKiSl7dGALT0oamAZVm/tpV/iT6eV/5D5x7SmsEOrx2JAOORWDr7f6vfRSfbKMsWxThIJTe/9iZuCkMa7OhHDl2TlNPMFezFmqYBG2gsU/f5BYv4VLWvoIyWd9kyN7PElGFzH9oJhC+tQlVzBt9AFzOcutHSSSVNKOAjgje8blgNsuKwD340hNDpVlTzMvmSDgYPC6zxfJhHgoV8f+t9lsGTuOH+sTKrvTnjBt7OM8YNvbhWcGK6ZN+ZQJfalo2GTAphqgBnaVUKAIk6Ib41wPMgY+Y1256HKuEAcriUYnMhaQjg7cwEhdnu0sSyvyRPfpQ/AqZkiLeu56OohuSpxB0DpsY9boSdnf+q3Orz16Pk1haQYRNOziFghFG/aJBrbPJdU4i74/IfsMUijtIMX96Da0guZPmmAFnotxUNOZAGB+iRHYChzAqo/77kSf1rMLe9R5X6xzMjKdivxPdkEUc/VUgefAbVOtqU3jBt7rawMX2e9oecQ+zlPhxKwXhBvQnIgRa6KH+JmnwePhO43Wz0kC52QFL/6jgniOrdN7l1X7aubyfyRpqmuWK7OyqFz5N1YWYdrOnZv4inxSTTKSqwPkW6e/6R9gWzbyf57CY6zRV/N7YtWjzDOYA9CRJI2eWHkhxlU8W/V4/NuSgJdSHSgkYaq5d0ccfNyQN2NB9u/GfpV9kE7uZBEtPIOiAP5qGmPoPF1z+UuADUAu+7MFqcjgHMAQjwBB/MUZttxakff8JjasrFxhD2jhmi2mJAG6ZwoV/U7vVlh4xejurKgu1wz6dZgRde6C+xZEqM1AtNeSVT/Vu6hLf6WHXGD3iU7RePaynFHvIDGPPAqFMay8Eh+kLh7f6DNB7qeFDr2aIwCgveEKyQ1OslT2zunvKZrfFV4H5ck4j1Uz/xvfJjU+e4Z3A1es/SeX/kUyHEh96OzDoftmpNq1MiT7Dt6m91VoosSCWbOGML8q92MXbiM5xh8yiezMK5+PPxOxdOjVefw0GBdS6RRO+1hVD27SdbXJHvzaCuBW2QeZ3eC5HL3hdMWIOypoyRwkKLTYhBBlG7zDd9GViuSgfAiDkrsKKfF8mpXy23502Jq1klO86XPiRRDo0MygWHgxCiY1MRuyjhHkBTu/TDU+vuxfjggMgEYx1AAWo8E0Xjca7Iw5h/CUQSp9gCFW1cyGZ6ThjCk1f05JFh4ZWvV1cUejTu/ODDer2B+fntLvgGnjVpriVln7lFQl9nUc4YqUnaHBjEBrjNZU9bXUw743UIbZaGrbsc6hgXKfbsdw9eL1se85tpVYh3MJKJ49z8YRpGFWselP+vZHN4xZhnw3SgKrfboIcph8S7CN29h6H/CNLjMf5DzV8/xfCBJDkRQWLc2eH1QAXE6ks+sQo1OTqVDPiphZgOiWKTnFQKr66fr1pXHf7Gcd33anilPb9CdNEgq/rxet19wjyWs/L6SrkCE6aMDwt8Q8mvLVzRI0o9EasmQ4FwWfNd87AFq8GVmYJBK71tL7GhpmyUz54cI5v2rcMv8+FHyzh51dvkD4u87yHC3rMGGQeTuPBt747tHWoJ3vKMC2/vpnOyEpyn+g2wj/FvCAAgk/qQMvmr0MjkDgZ/Hh/6HtP7K5QTz19PfKZ5T99BLTz+xanKKSKMmoyEnnayH4KhU/Ko1+qoTQoQfY+zTxfcnOEH+fBDKlEn5Ekkkbv/AQDJ4Sh4Vy1KnbcUQ0DRRn/C8N0R8Nds/2756ne6THwfMMGfZ3bTx+aPj+2DINn8ZLPYEn0vYB41D8vXmQm3T9SQSWdPUHtMjNYLMeAE0mr5HQnL7ZVSSTRgev11vo5hnDtSYCh3QvAiVWOelGnqDI2rE8FPomovP5k0rTzGt/cvyR9vxLLjT/agFKNi9xwzJhlZt7Q9IgM3CB4AOYAAQxd/HvmkkrJOlTX5Eot7kRyUPi7or4AAA';

function FlagEN() {
  return <img src={UNION_JACK} alt="" aria-hidden width={24} height={16} decoding="async" className="h-full w-full object-cover" />;
}

function FlagHU() {
  return (
    <svg viewBox="0 0 30 20" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      <rect width="30" height="6.67" fill="#CD2A3E" />
      <rect y="6.67" width="30" height="6.67" fill="#fff" />
      <rect y="13.33" width="30" height="6.67" fill="#436F4D" />
    </svg>
  );
}

const FLAGS: Record<Lang, { Flag: () => React.JSX.Element; name: string }> = {
  en: { Flag: FlagEN, name: 'English' },
  hu: { Flag: FlagHU, name: 'Magyar' },
};

export default function LanguageSwitcher({ className = '', large = false }: { className?: string; large?: boolean }) {
  const { lang, setLang } = useI18n();
  return (
    <div className={cx('flex items-center', large ? 'gap-2.5' : 'gap-1.5', className)} role="group" aria-label="Language / Nyelv">
      {(['en', 'hu'] as const).map((code) => {
        const { Flag, name } = FLAGS[code];
        const on = lang === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLang(code)}
            aria-pressed={on}
            aria-label={name}
            title={name}
            data-cursor="follow"
            className={cx(
              'relative block overflow-hidden border transition-all duration-200',
              large ? 'h-[22px] w-[33px]' : 'h-[16px] w-[24px]',
              on
                ? 'border-accent opacity-100 ring-1 ring-accent ring-offset-2 ring-offset-bg'
                : 'border-line opacity-45 grayscale hover:opacity-100 hover:grayscale-0',
            )}
          >
            <Flag />
          </button>
        );
      })}
    </div>
  );
}
