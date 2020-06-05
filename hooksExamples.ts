/* eslint-disable no-console */

import { useRef, useState, useCallback, useEffect } from 'react';

const outsideVal = 5;

const useHooksExample = (arg: number): Record<any, Function> => {
  const [state] = useState(5);
  const ref = useRef(5);

  /*
    Pass!

    this function doesn't rely on React state which could be stale.
    (and it wouldn't matter if it did because it isn't memoized)
  */
  const unMemoized = (): number => {
    return 10;
  };

  /*
    Pass!

    While it relies on react state - the function is recreated
    with the new values for state on every render - so those values
    won't be stale
  */
  const unMemoizedTwo = (): number => {
    return 10 + state;
  };

  const unMemoizedThree = (): number => {
    return 10 + arg;
  };

  /*
    Fail!

    memoized relies on a value of react state which
    isn't accessible in future renders.  So this callback
    will reference stale values.
  */
  const memoized = useCallback((): number => {
    return 10 + state;
  }, []);

  /*
    Fail!

    memoizedTwo relies on an argument passed to the hook.
    As such this argument value is within the scope of react state management
    and thus could itself be stale state.  It might not - but we can't know
    for sure.
  */
  const memoizedTwo = useCallback((): number => {
    return 10 + arg;
  }, []);

  /*
    Pass!

    You shouldn't declare everything you use
    in your function as a dependency so long as what you
    use can't possibly have stale state.

    These include unmemoised functions that don't depend on state (because
    they make memoisation redundant), variables declared outside the scope of
    react state management and or values in refs (because changes in these
    values don't cause rerenders in React components - so they can't
    be called with old values).
  */
  const memoizedThree = useCallback((): number => {
    return unMemoized() + outsideVal + ref.current;
  }, []);

  /*
    Fail!

    If you try to declare them as dependencies eslint will complain.
  */
  const memoizedThreeFail = useCallback((): number => {
    return unMemoized() + outsideVal + ref.current;
  }, [unMemoized, outsideVal, ref.current]);

  /*
    Fail!

    This has an unecessary dependency.  Changes to arg will cause useCallback
    to create new function instances that have identical inputs to outputs
    so there is no point in using memoization.
  */
  const memoizedFour = useCallback((): number => {
    return unMemoized();
  }, [arg]);

  /*
    Fail!

    Although memoizedFive does not directly rely on state that could be stale
    unMemoizedTwo does. Even though unMemoizedTwo is recreated every render
    with fresh state values - memoizedFive is not - and thus contains a reference
    back to the old value of unMemoizedTwo which contains the stale state.

    So it must be added as a dependency.
  */
  const memoizedFive = useCallback((): number => {
    return unMemoizedTwo();
  }, []);

  /*
    Fail!

    Like memoizedFive - expect with an argument passed to the hook.
  */
  const memoizedSix = useCallback((): number => {
    return unMemoizedThree();
  }, []);

  /*
    Fail!

    While this function is exactly the same as unMemoizedTwo
    which is unproblematic - it is a stateful dependency of the memoised function
    declared below: memoizedSeven.

    memoizedSeven won't go stale because unMemoizedFour is recreated every
    render - but this makes it redundant to use memoisation.  So we need
    to either memoise unMemoizedFour or declare it in the scope of memoizedSeven
  */
  const unMemoizedFour = (): number => {
    return 10 + state;
  };

  /*
    Pass!

    Like memoizedSix this function relies on another
    function that uses state that could be stale.  But we've
    provided the dependency so we've fixed that problem.

    As we saw above though - there isn't any point memoizing this.
  */
  const memoizedSeven = useCallback((): number => {
    return unMemoizedFour();
  }, [unMemoizedFour]);

  /*
    Fail!

    If you don't specify a dependency array - the callback is created
    every render - so there is no point in memoising it.
  */
  const memoizedEight = useCallback((): number => {
    return unMemoizedFour();
  });

  /*
    Pass!

    This effect has no dependencies - and thus will only be run
    once after the first render and never again.
  */
  useEffect(() => {
    console.log(`No time is passing - so no change can happen`);
  }, []);

  /*
    Pass!

    Unlike callbacks - it's fine not to specify a dependency array.
    It just means your effect will run after every render.
  */
  useEffect(() => {
    console.log(`Time is passing. But I never change.`);
  });

  /*
    Pass!

    Your effect will run every time your dependencies change.  So you
    can ensure effects that must run when such changes occur do so.

    This way you can ensure various aspects of app behaviour which are
    not an output of React (like the dom nodes it renders) but needs to be
    synced with react state - can be so aligned.
  */
  useEffect(() => {
    console.log(
      `Change is happening - but I only care when it's state: ${state} - that changes`,
    );
  }, [state]);

  /*
    Fail!

    Here hooks are the same as callbacks - if your effect relies on React
    state - then you must declare it as a dependency.
  */
  useEffect(() => {
    console.log(
      `Change might be happening in state: ${state} - but I won't tell you!`,
    );
  }, []);

  /*
    Pass!

    If you need to run an effect once using a stateful value pass it into ref
    first.  The value passed to useRef is only applied as the
    value of the ref on the first render - so it won't change each render unless
    you update the ref value explicitly:  ref.current = newValue.
  */
  const stateRef = useRef(state);
  useEffect(() => {
    console.log(
      `I want everyone to remember you state - the way you were
      when react first rendered: ${stateRef.current}
     `,
    );
  }, []);

  /*

    Pass!

    Unlike callbacks you can pass dependencies you don't explicitly use.  This
    is because it's reasonable to want to able to call effects merely because
    state is changing even if you don't care how it has changed.
  */
  useEffect(() => {
    console.log(`
     I need you to know that change has happened in state - but you don't need to
     know how it changed`);
  }, [state]);

  /*
    Pass!

    You can tie your effects to specific ways in which state has changed over time
    by using refs
  */
  useEffect(() => {
    const prevState = stateRef.current;
    if (state - prevState > 5) {
      console.log(`Life is exciting again!`);
    }
    stateRef.current = state;
  }, [state]);

  return {
    unMemoizedThree,
    memoized,
    memoizedTwo,
    memoizedThree,
    memoizedThreeFail,
    memoizedFour,
    memoizedFive,
    memoizedSix,
    memoizedSeven,
  };
};

export default useHooksExample;
