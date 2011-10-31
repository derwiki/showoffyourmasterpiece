class CreatePhotos < ActiveRecord::Migration
  def change
    create_table :photos do |t|
      t.string :username
      t.string :address1
      t.string :address2
      t.string :state
      t.integer :zipcode
      t.string :email
      t.string :url

      t.timestamps
    end
  end
end
