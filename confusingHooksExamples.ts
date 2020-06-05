import { useCallback } from 'react';

/*
  higherOrderFunc and impureFunc - wiil be used to illustrate
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

export const impureFunc = (arg: number): any => {
  return mutatedVal + arg;
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
    the linter otherwise warns you about because of the fear of mutations
    in external namespaces not triggering re-renders - but here it doesn't

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

    But note it has a direct reference to an external namespace.

    Normally the linter would reject this I asumme because values in external
    names spaces could have mutations that won't trigger rerenders -
    the mutations showing up in the application in ways that are difficult
    to follow.

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
