import { getAsyncOperation } from "../../repository/AsyncOperationRepository"
import { Context } from "../../context"

export const AsyncOperationQueries = {
  async asyncOperationStatus(parent: any, args: any, ctx: Context) {
    const { input: { id: operationId } } = args
    return {
      operation: getAsyncOperation(ctx, Number(operationId))
    }
  },
}
