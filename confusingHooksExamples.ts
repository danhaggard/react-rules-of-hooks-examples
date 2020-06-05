import { useCallback } from 'react';

/*
  higherOrderFunc and impureHoF - wiil be used to illustrate
  some issues in the hooks below.
*/
export const higherOrderFunc = (arg: number): any => {
  const unMemoized = (): number => {
    return 10 + arg;
  };
  return unMemoized;
};

let mutatedVal = 10;
setTimeout(() => (mutatedVal = 20), 5000);

export const impureHoF = (arg: number): any => {
  const impureFunc = (): number => mutatedVal + arg;
  return impureFunc;
};

export const useConfusingHooksExample = (): Record<any, Function> => {
  const unMemoized = higherOrderFunc(5);

  /*
    Pass?

    unMemoized will be a different function every
    render so adding it as a dependency make memoisation pointless.

    Correct memoization would still be fine though because
    unMemoized will always return the same value.

    Also - memoized ultimately relies on an external namespace as well which
    the linter otherwise warns you about because of the fear that mutations
    in external namespaces won't trigger re-renders immediately - causing
    side effects in application behaviour that are more difficult to understand.
    
    But then ultimately any namespace - even if declared in scope - could depend on another
    which is impure or mutates (like impureFunc) that the linter doesn't check. e.g.
  
    const unMemoized = impureHoF(5);
   
    const memoized = useCallback(() => {
      return unMemoized();
    }, [unMemoized]);

    If dependency on external namespaces is bad because of mutation - should we care in this
    case too?
  */
  const memoized = useCallback(() => {
    return unMemoized();
  }, [unMemoized]);


  /*
    Fail?

    This will memoise correctly but you don't include unMemoized as a
    dependency - then the linter will complain - forcing you to break your memoisation.
  */
  const memoizedTwo = useCallback(() => {
    return unMemoized();
  }, []);

  /*
    Pass?

    This passes even though it is functionally equivalent to
    memoizedTwo and correctly memoises.

    But note it has a direct reference to an external namespace that it would normally reject
    because of the external namespace concern.  Seems to be an eslint bug caused
    because the value of the first arg passed to useCallback isn't a function
    declared inline.
    
    It doesn't care if :
    useCallback(higherOrderFunc(5), []); or
    useCallback(impureHoF(5), [impureHoF]);
  */
  const memoizedThree = useCallback(higherOrderFunc(5), [higherOrderFunc]);

  /*

  Fail?

  This will fail because of the external namespace reason - even though
  it memoizes correctly and is functionally equivalent to memoizedTwo and
  memoizedThree

  */
  const memoizedFour = useCallback(() => higherOrderFunc(5)(), [
    higherOrderFunc,
  ]);

  return {
    memoized,
    memoizedTwo,
    memoizedThree,
    memoizedFour,
  };
};

export default useConfusingHooksExample;
