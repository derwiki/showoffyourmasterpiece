class AddStripeCustomerId < ActiveRecord::Migration
  def up
    add_column :photos, :stripe_customer_id, :integer
  end

  def down
    remove_column :photos, :stripe_customer_id
  end
end
