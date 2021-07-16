import useQueryParams from '../index.js'

export default function HomePage () {
  const [header, setHeader] = useQueryParams('header')
  const [seconds, setSeconds] = useQueryParams('seconds', Number)
  const [date, setDate] = useQueryParams('date', new Date())
  const [sort, setSort] = useQueryParams(
    'sort',
    [],
    a => a.map(s => s.split(':'))
  )

  return (
    <div>

      <h1>
        {header}
      </h1>

      <button onClick={() => setHeader('use-query-params')}>
        Set Header
      </button>

      <br />
      <br />

      {typeof seconds}: {seconds}

      <br />

      <button onClick={() => setSeconds(new Date().getTime())}>
        Set Seconds
      </button>

      <br />
      <br />

      Is Date? {`${date instanceof Date}`}: {date?.toLocaleString()}

      <br />

      <button onClick={() => setDate(new Date().toISOString())}>
        Set Date
      </button>

      <br />
      <br />

      Is Array? {`${Array.isArray(sort)}`}: {JSON.stringify(sort)}

      <br />

      <button onClick={() => setSort(['date:desc', 'id:asc'])}>
        Set Sort
      </button>

    </div>
  )
}
