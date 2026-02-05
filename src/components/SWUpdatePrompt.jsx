import { useRegisterSW } from "virtual:pwa-register/react";
import { RefreshCw } from "lucide-react";

export default function SWUpdatePrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // console.log('SW Registered: ' + r)
    },
    onRegisterError(error) {
      console.error("SW registration error", error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!needRefresh && !offlineReady) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-primary/20 dark:border-primary/30 rounded-2xl shadow-xl p-4 flex flex-col md:flex-row items-center gap-4 max-w-md ml-auto">
        <div className="bg-primary/10 p-2 rounded-full text-primary shrink-0">
          <RefreshCw size={20} className={needRefresh ? "animate-spin-slow" : ""} />
        </div>

        <div className="flex-1 text-center md:text-left">
          <p className="text-sm font-bold text-dark dark:text-white">{needRefresh ? "새 버전이 준비되었습니다!" : "오프라인에서 사용할 준비가 되었습니다."}</p>
          {needRefresh && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">최신 기능을 사용하려면 업데이트를 눌러주세요.</p>}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {needRefresh && (
            <button onClick={() => updateServiceWorker(true)} className="flex-1 md:flex-none px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-blue-600 transition-colors cursor-pointer">
              업데이트
            </button>
          )}
          <button
            onClick={() => close()}
            className="flex-1 md:flex-none px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
