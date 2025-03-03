

WITH  OrderedTable1 AS (
    SELECT *,
        ROW_NUMBER() OVER (ORDER BY DrawNumber) AS Seq
    FROM {TABLE_NAME}
),
UnpivotedTable1 AS (
    SELECT DrawNumber, 
		Number,
		Seq
    FROM OrderedTable1
    CROSS APPLY (
        VALUES 
            (Number1), (Number2), (Number3),
            (Number4), (Number5), (Number6), (Bonus)
    ) AS Unpivoted(Number)
),
Table2 AS (
	SELECT *, 
		-- Individual number parity
        CASE WHEN Number % 2 = 0 THEN 1 ELSE 0 END AS IsEven,
		-- Hits in last 10 draws (corrected window)
		SUM(CAST(IsHit AS INT)) OVER (
		PARTITION BY Number 
		ORDER BY DrawNumber 
		ROWS BETWEEN 9 PRECEDING AND CURRENT ROW) AS HitsLast10Draws
	FROM (
		select lt.DrawNumber, 
		--FORMAT(lt.DrawDate, 'yyyy-MM-dd') as drawDate, 
		nu.Value as Number, 
		nu.Distance, 
		nu.IsHit, 
		nu.NumberofDrawsWhenHit,
		nu.IsBonusNumber, 
		nu.TotalHits

		from [dbo].[LottoTypes] as lt 
		inner join [dbo].[Numbers] as nu 
			on lt.Id = nu.LottoTypeId
		where lt.LottoName = ?
	) temp
	where temp.DrawNumber > ? and temp.DrawNumber <= ? --3439
),
Table3 AS (
	SELECT DrawNumber,
        (CASE WHEN Number1 % 2 = 0 THEN 1 ELSE 0 END +
         CASE WHEN Number2 % 2 = 0 THEN 1 ELSE 0 END +
         CASE WHEN Number3 % 2 = 0 THEN 1 ELSE 0 END +
         CASE WHEN Number4 % 2 = 0 THEN 1 ELSE 0 END +
         CASE WHEN Number5 % 2 = 0 THEN 1 ELSE 0 END +
         CASE WHEN Number6 % 2 = 0 THEN 1 ELSE 0 END +
         CASE WHEN Bonus % 2 = 0 THEN 1 ELSE 0 END) AS EvenCount
    FROM {TABLE_NAME}
)  

SELECT 
    t1.DrawNumber,
    t1.Number,
	t1.IsHit,
    t1.Distance,
	t1.NumberofDrawsWhenHit,
    t1.HitsLast10Draws,
    t1.TotalHits,
    CASE WHEN t2.Number IS NOT NULL THEN 1 ELSE 0 END AS NextDrawHit,
	CASE WHEN t1.Distance = 0 THEN 0					--'Boiling'
	WHEN t1.Distance < 5 AND t1.Distance > 0  THEN 1	--'Hot'
	WHEN t1.Distance BETWEEN 5 AND 10 THEN 2			--'Normal'
	WHEN t1.Distance BETWEEN 10 AND 15 THEN 3			--'Cold' 
	WHEN t1.Distance >= 15 AND t1.Distance < 25 THEN 4  --'VeryCold' 
	WHEN t1.Distance >= 25 THEN 5						--'Freezing' 
	END AS Temperature,
	t1_prev.EvenCount AS PrevDrawEvenCount

	--t2.Number AS NextDrawHit2
FROM Table2 t1
LEFT JOIN OrderedTable1 ot1 
	ON t1.DrawNumber = ot1.DrawNumber 
LEFT JOIN UnpivotedTable1 t2 
    ON ot1.Seq + 1 = t2.Seq  -- Use sequential ordering
    AND t1.Number = t2.Number
	
	-- Join previous draw's EvenCount
LEFT JOIN Table3 t1_prev    
	ON t1.DrawNumber = t1_prev.DrawNumber
	WHERE t1.DrawNumber <= (SELECT MAX(DrawNumber) FROM Table2)  -- Exclude latest draw

ORDER BY t1.DrawNumber ASC, t1.Number ASC
