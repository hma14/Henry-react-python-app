CREATE TABLE AiTrainings (
    lotto_id INT NOT NULL,
    draw_number INT NOT NULL,
    model_version INT NOT NULL,
    draw_date DATE NULL,
    train_result NVARCHAR(MAX) NOT NULL,
    top_hit_numbers NVARCHAR(MAX) NOT NULL,
    model_binary VARBINARY(MAX) NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (lotto_id, draw_number, model_version)
);
