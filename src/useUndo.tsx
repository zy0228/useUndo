import { useReducer, useMemo, useState } from "react";

interface ReducerState<T> {
  present: T;
}

const undoReducer = <T extends any>(
  state: ReducerState<T>,
  values: T
): ReducerState<T> => ({
  present: values
});

function useUndo<T>(initState: T) {
  const [dep, setDep] = useState<T[]>([initState]);
  const [point, setPoint] = useState<number>(0);
  const initalState = { present: initState };

  const getDepMaxIndex = useMemo(() => dep.length - 1, [dep]);
  const depHasSub = useMemo(() => dep.length > 1, [dep]);
  const getDep = (index: number) => dep[index];
  const resetDep = () => setDep([initState]);
  const undoDep = (): T | any => {
    const undoIndex = point - 1;
    setPoint(undoIndex);
    return getDep(undoIndex) as T;
  };
  const redoDep = (): T | any => {
    const undoIndex = point + 1;
    setPoint(undoIndex);
    return getDep(undoIndex);
  };

  const canRedo = useMemo(() => depHasSub && point !== getDepMaxIndex, [
    point,
    getDepMaxIndex,
    depHasSub
  ]);
  const canUndo = useMemo(() => depHasSub && point !== 0, [point, depHasSub]);

  const [state, dispatch] = useReducer(undoReducer, initalState);

  const addDep = (state: any) => {
    dispatch(state);
    const currentPoint = point;
    let oldDep = dep;

    if (currentPoint !== getDepMaxIndex) {
      oldDep = dep.slice(0, currentPoint + 1);
    }

    const currentDep = [...oldDep, state];
    setDep(currentDep as T[]);
    setPoint(currentDep.length - 1); // reset point
  };

  const resetDo = (value: any) => {
    resetDep();
    setPoint(0);
    dispatch(value);
  };

  const undoHandle = () => {
    dispatch(undoDep());
  };

  const redoHandle = () => {
    dispatch(redoDep());
  };

  return [
    state as { present: T },
    {
      set: (addDep as unknown) as Function,
      reset: resetDo,
      undo: undoHandle,
      redo: redoHandle,
      canUndo,
      canRedo
    }
  ] as const;
}

export default useUndo;
