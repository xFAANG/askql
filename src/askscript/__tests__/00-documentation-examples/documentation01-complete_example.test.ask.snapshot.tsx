export = (
  <ask args={<list />}>
    <call
      name="test"
      args={
        <list>
          {"test 1"}
          <fun args={<list />} returns={<ref name="any" />}>
            <call
              name="toBe"
              args={
                <list>
                  <call
                    name="expect"
                    args={
                      <list>
                        <call
                          name="+"
                          args={
                            <list>
                              {2}
                              {2}
                            </list>
                          }
                          isOperator={true}
                        />
                      </list>
                    }
                  />
                  {4}
                </list>
              }
            />
            <call
              name="toBe"
              args={
                <list>
                  <call
                    name="expect"
                    args={
                      <list>
                        <call
                          name="+"
                          args={
                            <list>
                              {2}
                              {2}
                            </list>
                          }
                          isOperator={true}
                        />
                      </list>
                    }
                  />
                  {4}
                </list>
              }
            />
            <call
              name="toBe"
              args={
                <list>
                  <call
                    name="expect"
                    args={
                      <list>
                        <call
                          name="+"
                          args={
                            <list>
                              {3}
                              {8}
                            </list>
                          }
                          isOperator={true}
                        />
                      </list>
                    }
                  />
                  {11}
                </list>
              }
            />
          </fun>
        </list>
      }
    />
  </ask>
);
