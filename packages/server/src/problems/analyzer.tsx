enum ProblemType{
    Error,
    Warning
}

interface IResponsiveProblem{
    text: string,
    pType: ProblemType
}

export interface IAnalyzedData {
    errors: IResponsiveProblem[],
    warnings: IResponsiveProblem[],
  }

export function analyze(body: any): IAnalyzedData {
    const data: IAnalyzedData = {
        errors: [],
        warnings: []
    }

    const newProblem: IResponsiveProblem = {
        text: `${body.querySelectorAll('p').length} elements`,
        pType: ProblemType.Error
    }
    data.errors.push(newProblem)
    return data
}