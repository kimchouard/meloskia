import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { Platform } from "react-native";
import {
  SharedValue,
  makeMutable,
  useSharedValue,
} from "react-native-reanimated";
import { PIANO_KEYS_ALL } from "../data";

export type IPianoKey = (typeof PIANO_KEYS_ALL)[number];
export type IPianoKeys = IPianoKey[];

type KeyboardControllerContext = {
  activeKeys: SharedValue<IPianoKeys>;
  pushKeys: (...keys: IPianoKeys) => void;
  releaseKeys: (...keys: IPianoKeys) => void;
};

const KeyboardContext = createContext<KeyboardControllerContext>({
  activeKeys: makeMutable([]),
  pushKeys: () => {},
  releaseKeys: () => {},
});

export const KeyboardController: FC<PropsWithChildren> = ({ children }) => {
  const activeKeys = useSharedValue<IPianoKeys>([]);
  const actions = useMemo(
    () => ({
      activeKeys,
      pushKeys: (...keys: IPianoKeys) => {
        "worklet";

        activeKeys.value = Array.from(new Set([...activeKeys.value, ...keys]));
      },
      releaseKeys: (...keys: IPianoKeys) => {
        "worklet";

        activeKeys.value = activeKeys.value.filter(
          (key) => !keys.includes(key)
        );
      },
    }),
    [activeKeys]
  );

  useEffect(() => {
    if (Platform.OS !== "web") {
      return;
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey) return;

      const key = e.key.toUpperCase() as any;
      if (PIANO_KEYS_ALL.includes(key)) {
        actions.pushKeys(key as IPianoKey);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.metaKey) return;

      const key = e.key.toUpperCase() as any;
      if (PIANO_KEYS_ALL.includes(key)) {
        actions.releaseKeys(key as IPianoKey);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return (
    <KeyboardContext.Provider value={actions}>
      {children}
    </KeyboardContext.Provider>
  );
};

export const useKeyboard = () => {
  const context = useContext(KeyboardContext);
  if (!context) {
    throw new Error("useKeyboard must be used within a KeyboardController");
  }
  return context;
};
